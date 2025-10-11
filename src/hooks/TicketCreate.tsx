import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Select,
  Textarea,
  VStack,
  Spinner,
  StackDivider,
  Text,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Badge,
} from "@chakra-ui/react";
import Navbar from "../components/Navbar";
import { useTickets, useCreateTicket } from "../hooks/useTickets";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api";

export default function TicketsList() {
  const { data: tickets, isLoading } = useTickets();
  const createTicket = useCreateTicket();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [selected, setSelected] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // ✅ Obtener usuario logueado y su rol
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const openTicket = (t: any) => {
    setSelected(t);
    onOpen();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket.mutate(
      { title, description, priority },
      {
        onSuccess: () => {
          toast.success("Ticket creado con éxito ✅");
          setTitle("");
          setDescription("");
        },
        onError: () => toast.error("Error al crear el ticket ❌"),
      }
    );
  };

  // ✅ Función para cambiar estado del ticket
  const handleStatusChange = (id: string, newStatus: string) => {
    api
      .patch(`/tickets/${id}/status`, { status: newStatus })
      .then(() => {
        toast.success("Estado actualizado ✅");
        onClose();
        // refrescar listado
        setTimeout(() => window.location.reload(), 800);
      })
      .catch(() => toast.error("Error al actualizar estado ❌"));
  };

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Navbar />
      <Box p={8}>
        <Heading mb={6}>Mis Tickets</Heading>

        <form onSubmit={handleCreate}>
          <VStack spacing={4} align="stretch" mb={6}>
            <Input
              placeholder="Título del ticket"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Textarea
              placeholder="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </Select>
            <Button type="submit" colorScheme="teal">
              Crear ticket
            </Button>
          </VStack>
        </form>

        {isLoading ? (
          <Flex justify="center" align="center" h="100px">
            <Spinner size="lg" />
          </Flex>
        ) : (
          <VStack
            spacing={4}
            divider={<StackDivider borderColor="gray.600" />}
            align="stretch"
          >
            {tickets?.map((t: any) => (
              <Box
                key={t.id}
                p={4}
                bg="gray.700"
                rounded="md"
                cursor="pointer"
                onClick={() => openTicket(t)}
                _hover={{ bg: "gray.600" }}
              >
                <Text fontWeight="bold">{t.code}</Text>
                <Text>{t.title}</Text>
                <Badge colorScheme="blue" mt={2}>
                  {t.status}
                </Badge>
              </Box>
            ))}
          </VStack>
        )}
      </Box>

      {/* ✅ Drawer de detalle */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent bg="gray.800" color="white">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            {selected?.title || "Ticket"}
          </DrawerHeader>
          <DrawerBody>
            {selected ? (
              <>
                <Text mb={2}>
                  <b>Código:</b> {selected.code}
                </Text>
                <Text mb={2}>
                  <b>Prioridad:</b> {selected.priority}
                </Text>
                <Text mb={2}>
                  <b>Estado actual:</b> {selected.status}
                </Text>
                <Text mt={4}>{selected.description}</Text>

                {/* ✅ Solo ADMIN o AGENT pueden cambiar estado */}
                {["ADMIN", "AGENT"].includes(user.role) && (
                  <Select
                    mt={6}
                    defaultValue={selected.status}
                    onChange={(e) =>
                      handleStatusChange(selected.id, e.target.value)
                    }
                  >
                    <option value="OPEN">Abierto</option>
                    <option value="IN_PROGRESS">En progreso</option>
                    <option value="RESOLVED">Resuelto</option>
                    <option value="CLOSED">Cerrado</option>
                  </Select>
                )}
              </>
            ) : (
              <Text>No hay ticket seleccionado</Text>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
