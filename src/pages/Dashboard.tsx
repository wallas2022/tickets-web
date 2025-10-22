import {
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Text,
  Tag,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  Input,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { api } from "../api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface StatusSummary {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

interface UserStat {
  id: string;
  name: string;
  tickets: number;
}

interface TicketsByStatus {
  status: string;
  _count: { id: number } | number;
}

interface DashboardStats {
  userStats: UserStat[];
  ticketsByStatus: TicketsByStatus[];
  summary: StatusSummary;
}

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "AGENT" | "CUSTOMER";
}

const STATUS_META: Record<
  string,
  { label: string; badge: string; color: string }
> = {
  OPEN: { label: "Abiertos", badge: "OPEN", color: "#38A169" },
  IN_PROGRESS: { label: "En progreso", badge: "IN_PROGRESS", color: "#3182CE" },
  RESOLVED: { label: "Resueltos", badge: "RESOLVED", color: "#D69E2E" },
  CLOSED: { label: "Cerrados", badge: "CLOSED", color: "#E53E3E" },
};

const ROLE_COLOR: Record<ManagedUser["role"], string> = {
  ADMIN: "purple",
  AGENT: "teal",
  CUSTOMER: "orange",
};

const CHART_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const getCountFromGroup = (item: TicketsByStatus) =>
  typeof item._count === "number" ? item._count : item._count?.id ?? 0;

const formatErrorMessage = (error: unknown) => {
  const fallback = "Ocurrió un error inesperado";
  if (error && typeof error === "object" && "response" in error) {
    const err = error as any;
    const message = err.response?.data?.message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    if (typeof message === "string") return message;
  }
  return fallback;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [role, setRole] = useState<string>("");
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<ManagedUser["role"]>("AGENT");

  const createUserModal = useDisclosure();
  const cardBg = useColorModeValue("gray.100", "gray.700");
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const innerCardBg = useColorModeValue("white", "gray.800");

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const { data } = await api.get<DashboardStats>("/tickets/stats");
      setStats(data);
    } catch (error) {
      toast.error(
        formatErrorMessage(error) || "No se pudieron cargar las estadísticas"
      );
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      const { data } = await api.get<ManagedUser[]>("/users");
      setUsers(data);
    } catch (error) {
      toast.error(
        formatErrorMessage(error) || "No se pudieron cargar los usuarios"
      );
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setRole(payload.role);
      fetchStats();
      if (payload.role === "ADMIN") {
        fetchUsers();
      }
    } catch (error) {
      toast.error(
        formatErrorMessage(error) || "No se pudo obtener la información del usuario"
      );
    }
  }, [fetchStats, fetchUsers]);

  const summaryCards = useMemo(() => {
    if (!stats?.summary) return [];
    return [
      { key: "total", label: "Total de tickets", value: stats.summary.total, accent: "blue.400" },
      { key: "open", label: "Abiertos", value: stats.summary.open, accent: "green.400" },
      { key: "inProgress", label: "En progreso", value: stats.summary.inProgress, accent: "cyan.400" },
      { key: "resolved", label: "Resueltos", value: stats.summary.resolved, accent: "yellow.400" },
      { key: "closed", label: "Cerrados", value: stats.summary.closed, accent: "red.400" },
    ];
  }, [stats?.summary]);

  const pieData = useMemo(() => {
    if (!stats?.ticketsByStatus) return [];
    return stats.ticketsByStatus
      .map((item) => {
        const meta = STATUS_META[item.status] ?? {
          label: item.status ?? "Sin estado",
          color: "#A0AEC0",
          badge: item.status ?? "UNKNOWN",
        };
        return {
          key: item.status,
          name: meta.label,
          value: getCountFromGroup(item),
        };
      })
      .filter((item) => item.value > 0);
  }, [stats?.ticketsByStatus]);

  const ticketsPerUser = useMemo(() => {
    const map = new Map<string, number>();
    stats?.userStats?.forEach((item) => {
      if (item?.id) {
        map.set(item.id, item.tickets ?? 0);
      }
    });
    return map;
  }, [stats?.userStats]);

  const handleOpenCreateUser = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("AGENT");
    createUserModal.onOpen();
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreatingUser(true);
    try {
      await api.post("/users", {
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole,
      });
      toast.success("Usuario creado correctamente");
      createUserModal.onClose();
      setFormName("");
      setFormEmail("");
      setFormPassword("");
      setFormRole("AGENT");
      await Promise.all([fetchUsers(), fetchStats()]);
    } catch (error) {
      toast.error(
        formatErrorMessage(error) || "No se pudo crear el usuario"
      );
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <Box minH="100vh" bg={pageBg}>
      <Navbar />
      <Box p={[6, 8, 12]}>
        <Flex justify="space-between" align={["flex-start", "center"]} mb={8} direction={["column", "row"]} gap={4}>
          <Box>
            <Heading size="lg">Panel de control</Heading>
            <Text mt={1} color="gray.500">
              Visualiza el rendimiento de tus tickets y gestiona tu equipo.
            </Text>
          </Box>
          {role && (
            <Tag size="lg" colorScheme={ROLE_COLOR[role as ManagedUser["role"]] ?? "gray"}>
              Rol: {role}
            </Tag>
          )}
        </Flex>

        {isStatsLoading ? (
          <Flex justify="center" align="center" h="200px">
            <Spinner size="xl" />
          </Flex>
        ) : stats ? (
          <>
            <SimpleGrid columns={[1, 2, 3, 5]} spacing={4}>
              {summaryCards.map((card) => (
                <Box key={card.key} bg={cardBg} p={5} rounded="lg" shadow="md">
                  <Stat>
                    <StatLabel>{card.label}</StatLabel>
                    <StatNumber color={card.accent}>{card.value}</StatNumber>
                  </Stat>
                </Box>
              ))}
            </SimpleGrid>

            <SimpleGrid columns={[1, 1, 2]} spacing={6} mt={8}>
              <Box bg={cardBg} p={6} rounded="lg" shadow="md" minH="360px">
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md">Distribución por estado</Heading>
                </Flex>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.key}-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Flex justify="center" align="center" h="100%">
                    <Text color="gray.500">No hay datos suficientes para mostrar la gráfica.</Text>
                  </Flex>
                )}
              </Box>

              {role === "ADMIN" && stats.userStats.length > 0 && (
                <Box bg={cardBg} p={6} rounded="lg" shadow="md">
                  <Heading size="md" mb={4}>
                    Tickets creados por usuario
                  </Heading>
                  <SimpleGrid columns={[1, 2]} spacing={4}>
                    {stats.userStats.map((stat) => (
                      <Box key={stat.id} bg={innerCardBg} p={4} rounded="md" shadow="sm">
                        <Stat>
                          <StatLabel>{stat.name}</StatLabel>
                          <StatNumber>{stat.tickets}</StatNumber>
                        </Stat>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}
            </SimpleGrid>
          </>
        ) : (
          <Text color="gray.500">No pudimos cargar la información del dashboard.</Text>
        )}

        {role === "ADMIN" && (
          <Box mt={12} bg={cardBg} p={6} rounded="lg" shadow="md">
            <Flex justify="space-between" align={["flex-start", "center"]} direction={["column", "row"]} gap={4} mb={6}>
              <Box>
                <Heading size="md">Gestión de usuarios</Heading>
                <Text color="gray.500">
                  Crea nuevos usuarios para tu equipo y revisa su actividad reciente.
                </Text>
              </Box>
              <Button colorScheme="teal" onClick={handleOpenCreateUser}>
                + Nuevo usuario
              </Button>
            </Flex>

            {isUsersLoading ? (
              <Flex justify="center" align="center" h="160px">
                <Spinner size="lg" />
              </Flex>
            ) : users.length === 0 ? (
              <Text color="gray.500">Aún no hay usuarios registrados.</Text>
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Nombre</Th>
                    <Th>Email</Th>
                    <Th>Rol</Th>
                    <Th isNumeric>Tickets creados</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((user) => (
                    <Tr key={user.id}>
                      <Td>{user.name}</Td>
                      <Td>{user.email}</Td>
                      <Td>
                        <Tag colorScheme={ROLE_COLOR[user.role] ?? "gray"}>
                          {user.role}
                        </Tag>
                      </Td>
                      <Td isNumeric>{ticketsPerUser.get(user.id) ?? 0}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Box>
        )}
      </Box>

      <Modal isOpen={createUserModal.isOpen} onClose={createUserModal.onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crear nuevo usuario</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleCreateUser}>
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Input
                  placeholder="Nombre completo"
                  value={formName}
                  onChange={(event) => setFormName(event.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Correo electrónico"
                  value={formEmail}
                  onChange={(event) => setFormEmail(event.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Contraseña temporal"
                  value={formPassword}
                  onChange={(event) => setFormPassword(event.target.value)}
                  minLength={6}
                  required
                />
                <Select
                  value={formRole}
                  onChange={(event) =>
                    setFormRole(event.target.value as ManagedUser["role"])
                  }
                >
                  <option value="ADMIN">Administrador</option>
                  <option value="AGENT">Agente</option>
                  <option value="CUSTOMER">Cliente</option>
                </Select>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                mr={3}
                variant="ghost"
                onClick={createUserModal.onClose}
                isDisabled={isCreatingUser}
              >
                Cancelar
              </Button>
              <Button colorScheme="teal" type="submit" isLoading={isCreatingUser}>
                Crear usuario
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
}
