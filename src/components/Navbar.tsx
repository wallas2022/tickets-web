import {
  Flex,
  Button,
  Heading,
  useColorMode,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Badge,
  Box,
  Text,
  Spinner,
  Divider,
} from "@chakra-ui/react";
import { BellIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useNotifications } from "../hooks/useNotifications";
import type { AppNotification } from "../types/notification";

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const { notificationsQuery, markAsRead, markAllAsRead } = useNotifications();

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((item) => !item.readAt).length;

  const STATUS_LABELS: Record<string, string> = {
    OPEN: "Abierto",
    IN_PROGRESS: "En progreso",
    RESOLVED: "Resuelto",
    CLOSED: "Cerrado",
  };

  const formatNotificationLabel = (notification: AppNotification) => {
    const { payload = {} } = notification;
    const code = payload.code ? `#${payload.code}` : "";

    switch (notification.type) {
      case "ticket_created": {
        const title = payload.title ?? "Nuevo ticket";
        const createdBy = payload.createdBy ?? "un usuario";
        return `🎟️ ${title} ${code} creado por ${createdBy}.`;
      }
      case "ticket_status_changed": {
        const statusKey = (payload.status as string) || "";
        const readableStatus =
          STATUS_LABELS[statusKey] ?? (statusKey || "sin estado");
        return `🔄 ${code || "Ticket"} cambió a ${readableStatus}.`;
      }
      case "ticket_assigned": {
        const assignedTo = payload.assignedTo ?? "un agente";
        return `📌 ${code || "Ticket"} asignado a ${assignedTo}.`;
      }
      case "ticket_commented": {
        const commentedBy = payload.commentedBy ?? "Alguien";
        const preview = payload.commentPreview
          ? `: ${payload.commentPreview}`
          : ".";
        return `💬 ${commentedBy} comentó ${code || "el ticket"}${preview}`;
      }
      default:
        return notification.type;
    }
  };

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("es-MX", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(date));

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.readAt) {
      markAsRead.mutate(notification.id);
    }
  };

  const handleLogout = () => {
    toast(
      (t) => (
        <span>
          ¿Cerrar sesión?
          <Button
            size="sm"
            ml={2}
            colorScheme="red"
            onClick={() => {
              toast.dismiss(t.id);
              logout();
              toast.success("Sesión cerrada correctamente 👋");
            }}
          >
            Sí
          </Button>
        </span>
      ),
      { duration: 4000 }
    );
  };

  return (
    <Flex
      bg={useColorModeValue("gray.800", "gray.900")}
      color="white"
      px={6}
      py={3}
      align="center"
      justify="space-between"
      boxShadow="md"
    >
      <Heading
        as="h2"
        fontSize="xl"
        cursor="pointer"
        onClick={() => navigate("/tickets")}
      >
        🎟️ Sistema de Tickets
      </Heading>

      <Flex align="center" gap={3}>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Notificaciones"
            variant="ghost"
            icon={
              <Box position="relative" display="inline-flex">
                <BellIcon />
                {unreadCount > 0 && (
                  <Badge
                    colorScheme="red"
                    position="absolute"
                    top="-1"
                    right="-1"
                    borderRadius="full"
                    fontSize="0.6rem"
                    px={1}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Box>
            }
          />
          <MenuList minW="340px" maxW="360px">
            <Box px={4} py={2}>
              <Text fontWeight="bold">Notificaciones</Text>
            </Box>
            <Divider />
            {notificationsQuery.isLoading ? (
              <Flex justify="center" py={6}>
                <Spinner size="sm" />
              </Flex>
            ) : notifications.length === 0 ? (
              <Box px={4} py={4}>
                <Text fontSize="sm" color="gray.500">
                  No tienes notificaciones por ahora.
                </Text>
              </Box>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <MenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  fontWeight={notification.readAt ? "normal" : "semibold"}
                  whiteSpace="normal"
                  py={3}
                >
                  <Box>
                    <Text>{formatNotificationLabel(notification)}</Text>
                    <Text fontSize="xs" color="gray.400">
                      {formatDate(notification.createdAt)}
                    </Text>
                  </Box>
                </MenuItem>
              ))
            )}
            {notifications.length > 0 && (
              <>
                <Divider />
                <MenuItem
                  onClick={() => markAllAsRead.mutate()}
                  isDisabled={
                    markAllAsRead.isPending ||
                    notifications.every((notification) => notification.readAt)
                  }
                >
                  {markAllAsRead.isPending
                    ? "Marcando..."
                    : "Marcar todas como leídas"}
                </MenuItem>
              </>
            )}
          </MenuList>
        </Menu>
        <IconButton
          aria-label="Cambiar tema"
          onClick={toggleColorMode}
          variant="ghost"
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
        />
        <Button colorScheme="red" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </Flex>
    </Flex>
  );
}
