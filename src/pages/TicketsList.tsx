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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  IconButton,
} from "@chakra-ui/react";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, ArrowRightIcon, SearchIcon } from "@chakra-ui/icons";

export default function TicketsList() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [selected, setSelected] = useState<any>(null);
  const [role, setRole] = useState<string>("");
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const [statusLocal, setStatusLocal] = useState<string>("OPEN");
  const [agents, setAgents] = useState<any[]>([]);

  // 📦 Cargar tickets con paginación y búsqueda
  const loadTickets = async (pageNum = 1, searchText = "") => {
    setLoading(true);
    try {
      const res = await api.get("/tickets", {
        params: { page: pageNum, limit, search: searchText },
      });
      setTickets(res.data.data || []); // ✅ solo el array
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.page || 1);
    } catch {
      toast.error("Error al cargar tickets ❌");
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Cargar rol del usuario
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setRole(payload.role);
    }
    loadTickets();
  }, []);

  // 🔄 Sincronizar estado local al abrir ticket
  useEffect(() => {
    if (selected?.status) setStatusLocal(selected.status);
  }, [selected]);

  // 🧭 Modales y Drawer
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();

  // 📋 Abrir detalle
  const openTicket = (t: any) => {
    setSelected(t);
    onDrawerOpen();
  };

  // ➕ Crear ticket
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/tickets", { title, description, priority });
      toast.success("Ticket creado con éxito ✅");
      setTitle("");
      setDescription("");
      onModalClose();
      loadTickets();
    } catch {
      toast.error("Error al crear el ticket ❌");
    }
  };

  // 🔄 Cambiar estado
  const handleChangeStatus = async (newStatus: string) => {
    if (!selected?.id) return;
    try {
      await api.patch(`/tickets/${selected.id}/status`, { status: newStatus });
      setStatusLocal(newStatus);
      setSelected((prev: any) => (prev ? { ...prev, status: newStatus } : prev));
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Estado actualizado ✅");
    } catch {
      toast.error("Error al actualizar estado ❌");
    }
  };

  // 👩‍💻 Cargar agentes solo para admin
  useEffect(() => {
    if (role === "ADMIN") {
      api
        .get("/users?role=AGENT")
        .then((res) => setAgents(res.data))
        .catch(() => toast.error("Error al cargar agentes"));
    }
  }, [role]);

  const handleAssignAgent = async (assigneeId: string) => {
    if (!selected?.id) return;
    try {
      await api.patch(`/tickets/${selected.id}/assign`, { assigneeId });
      toast.success("Ticket asignado correctamente ✅");
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      loadTickets(page);
    } catch {
      toast.error("Error al asignar ticket ❌");
    }
  };

  // 🎨 Render
  return (
    <Box minH="100vh">
      <Navbar />
      <Box p={8}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading>Mis Tickets</Heading>

          <Flex gap={3}>
            {role === "CUSTOMER" && (
              <Button colorScheme="teal" onClick={onModalOpen}>
                + Nuevo Ticket
              </Button>
            )}
            {role === "ADMIN" && (
              <Button
                colorScheme="purple"
                variant="solid"
                onClick={() => navigate("/dashboard")}
              >
                📊 Ir al Dashboard
              </Button>
            )}
          </Flex>
        </Flex>

        {/* 🔍 Buscador */}
        <Flex mb={4} gap={2}>
          <Input
            placeholder="Buscar tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg="gray.700"
          />
          <IconButton
            icon={<SearchIcon />}
            colorScheme="teal"
            aria-label="Buscar"
            onClick={() => loadTickets(1, search)}
          />
        </Flex>

        {/* 📋 Listado */}
        {loading ? (
          <Flex justify="center" align="center" h="100px">
            <Spinner size="lg" />
          </Flex>
        ) : (
          <VStack
            spacing={4}
            divider={<StackDivider borderColor="gray.600" />}
            align="stretch"
          >
            {Array.isArray(tickets) && tickets.length > 0 ? (
              tickets.map((t: any) => (
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
                  <Text fontSize="sm" color="gray.300" mt={1}>
                    🧑‍💻 <b>Creado por:</b> {t.author?.name || "Desconocido"}
                  </Text>
                  <Text fontSize="sm" color="gray.300">
                    👩‍🔧 <b>Asignado a:</b> {t.assignee?.name || "No asignado"}
                  </Text>
                  <Badge colorScheme="blue" mt={2}>
                    {t.status}
                  </Badge>
                </Box>
              ))
            ) : (
              <Text color="gray.400" textAlign="center">
                No hay tickets para mostrar.
              </Text>
            )}
          </VStack>
        )}

        {/* 📄 Paginador */}
        <Flex justify="center" mt={6} align="center" gap={4}>
          <IconButton
            icon={<ArrowLeftIcon />}
            aria-label="Anterior"
            onClick={() => page > 1 && loadTickets(page - 1, search)}
            isDisabled={page <= 1}
          />
          <Text>
            Página {page} de {totalPages}
          </Text>
          <IconButton
            icon={<ArrowRightIcon />}
            aria-label="Siguiente"
            onClick={() => page < totalPages && loadTickets(page + 1, search)}
            isDisabled={page >= totalPages}
          />
        </Flex>

        {/* Drawer de detalles */}
        <Drawer
          isOpen={isDrawerOpen}
          placement="right"
          onClose={onDrawerClose}
          size="md"
        >
          <DrawerOverlay />
          <DrawerContent bg="gray.800" color="white">
            <DrawerCloseButton />
            <DrawerHeader>{selected?.title}</DrawerHeader>
            <DrawerBody>
              {role === "ADMIN" && (
                <>
                  <Text mt={6} mb={2}>
                    <b>Asignar ticket:</b>
                  </Text>
                  <Select
                    placeholder="Seleccionar agente..."
                    onChange={(e) => handleAssignAgent(e.target.value)}
                  >
                    {agents.map((a: any) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </Select>
                </>
              )}

              <Text mb={2}><b>Código:</b> {selected?.code}</Text>
              <Text mb={2}><b>Prioridad:</b> {selected?.priority}</Text>
              <Text mb={2}><b>Estado actual:</b> {statusLocal}</Text>
              <Text mb={2}><b>Creado por:</b> {selected?.author?.name || "Desconocido"}</Text>
              <Text mb={2}><b>Asignado a:</b> {selected?.assignee?.name || "No asignado"}</Text>

              <Select
                mt={4}
                value={statusLocal}
                onChange={(e) => handleChangeStatus(e.target.value)}
              >
                <option value="OPEN">Abierto</option>
                <option value="IN_PROGRESS">En progreso</option>
                <option value="RESOLVED">Resuelto</option>
                <option value="CLOSED">Cerrado</option>
              </Select>

              <Text mt={6} whiteSpace="pre-wrap">
                {selected?.description}
              </Text>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Modal para crear nuevo ticket */}
        <Modal isOpen={isModalOpen} onClose={onModalClose} size="lg">
          <ModalOverlay />
          <ModalContent bg="gray.800" color="white">
            <ModalHeader>Crear nuevo ticket</ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleCreate}>
              <ModalBody>
                <VStack spacing={4} align="stretch">
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
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="teal" mr={3} type="submit">
                  Crear
                </Button>
                <Button variant="outline" onClick={onModalClose}>
                  Cancelar
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
}
