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
  Divider,
} from "@chakra-ui/react";
import Navbar from "../components/Navbar";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import toast from "react-hot-toast";
import { api } from "../api";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, ArrowRightIcon, SearchIcon } from "@chakra-ui/icons";
import type { TicketComment } from "../types/ticket";

export default function TicketsList() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [selected, setSelected] = useState<any>(null);
  const [role, setRole] = useState<string>("");
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const [statusLocal, setStatusLocal] = useState<string>("OPEN");
  const [agents, setAgents] = useState<any[]>([]);
  const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(page * limit, totalItems);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const COMMENT_ROLE_COLOR: Record<string, string> = {
    ADMIN: "purple",
    AGENT: "teal",
    CUSTOMER: "orange",
  };
  const commentDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("es-MX", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    []
  );

  // 📦 Cargar tickets con paginación y búsqueda
  const loadTickets = async (
    pageNum = 1,
    searchText = "",
    limitParam = limit
  ) => {
    setLoading(true);
    try {
      const res = await api.get("/tickets", {
        params: {
          page: pageNum,
          limit: limitParam,
          search: searchText.trim() || undefined,
        },
      });
      setTickets(res.data.data || []); // ✅ solo el array
      setTotalPages(Math.max(1, res.data.totalPages || 1));
      setTotalItems(res.data.total ?? 0);
      setPage(res.data.page || pageNum);
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
    loadTickets(1, "", limit);
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

  const loadComments = async (ticketId: string) => {
    setCommentsLoading(true);
    try {
      const res = await api.get(`/tickets/${ticketId}/comments`);
      setComments(res.data.comments || []);
    } catch {
      toast.error("Error al cargar comentarios ❌");
    } finally {
      setCommentsLoading(false);
    }
  };

  const resetCommentsState = () => {
    setComments([]);
    setCommentText("");
    setCommentsLoading(false);
  };

  // 📋 Abrir detalle
  const openTicket = (t: any) => {
    setSelected(t);
    resetCommentsState();
    loadComments(t.id);
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
      loadTickets(1, search, limit);
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
      loadTickets(page, search, limit);
    } catch {
      toast.error("Error al asignar ticket ❌");
    }
  };

  const handleSearch = () => {
    const trimmed = search.trim();
    setSearch(trimmed);
    loadTickets(1, trimmed, limit);
  };

  const handleSubmitComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected?.id) return;
    const trimmed = commentText.trim();
    if (!trimmed) {
      toast.error("Escribe un comentario antes de enviarlo");
      return;
    }
    setCommentSubmitting(true);
    try {
      const res = await api.post(`/tickets/${selected.id}/comments`, {
        content: trimmed,
      });
      setComments((prev) => [...prev, res.data]);
      setCommentText("");
      toast.success("Comentario agregado ✅");
    } catch {
      toast.error("Error al agregar comentario ❌");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDrawerClose = () => {
    onDrawerClose();
    resetCommentsState();
  };

  const canComment = ["ADMIN", "AGENT", "CUSTOMER"].includes(role);

  const handleClearSearch = () => {
    setSearch("");
    loadTickets(1, "", limit);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newLimit = Number(event.target.value);
    setLimit(newLimit);
    loadTickets(1, search.trim(), newLimit);
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
        <Flex
          mb={4}
          gap={2}
          flexWrap="wrap"
          align={["stretch", "center"]}
        >
          <Input
            placeholder="Buscar tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSearch();
            }}
            bg="gray.700"
            maxW={["100%", "320px", "360px"]}
          />
          <IconButton
            icon={<SearchIcon />}
            colorScheme="teal"
            aria-label="Buscar"
            onClick={handleSearch}
            isLoading={loading}
          />
          <Button
            variant="ghost"
            onClick={handleClearSearch}
            isDisabled={!search.trim()}
          >
            Limpiar
          </Button>
          <Select
            value={String(limit)}
            onChange={handleLimitChange}
            maxW={["100%", "180px"]}
            bg="gray.700"
          >
            <option value="5">5 por página</option>
            <option value="10">10 por página</option>
            <option value="20">20 por página</option>
          </Select>
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
        <Flex
          justify="space-between"
          align={["flex-start", "center"]}
          flexWrap="wrap"
          gap={3}
          mt={6}
        >
          <Text color="gray.400">
            {totalItems > 0
              ? `Mostrando ${startItem}-${endItem} de ${totalItems} tickets`
              : "Sin resultados"}
          </Text>
          <Flex align="center" gap={4}>
            <IconButton
              icon={<ArrowLeftIcon />}
              aria-label="Anterior"
              onClick={() =>
                page > 1 && loadTickets(page - 1, search, limit)
              }
              isDisabled={page <= 1 || loading}
            />
            <Text>
              Página {page} de {totalPages}
            </Text>
            <IconButton
              icon={<ArrowRightIcon />}
              aria-label="Siguiente"
              onClick={() =>
                page < totalPages && loadTickets(page + 1, search, limit)
              }
              isDisabled={page >= totalPages || loading}
            />
          </Flex>
        </Flex>

        {/* Drawer de detalles */}
        <Drawer
          isOpen={isDrawerOpen}
          placement="right"
          onClose={handleDrawerClose}
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

              <Divider my={6} />
              <Heading size="sm" mb={3}>
                Comentarios
              </Heading>
              {commentsLoading ? (
                <Flex justify="center" py={4}>
                  <Spinner size="sm" />
                </Flex>
              ) : comments.length > 0 ? (
                <VStack spacing={3} align="stretch">
                  {comments.map((comment) => (
                    <Box
                      key={comment.id}
                      bg="gray.700"
                      p={3}
                      rounded="md"
                      shadow="sm"
                    >
                      <Flex justify="space-between" align="center" gap={3}>
                        <Text fontWeight="bold">
                          {comment.author?.name || "Usuario"}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {commentDateFormatter.format(
                            new Date(comment.createdAt)
                          )}
                        </Text>
                      </Flex>
                      <Badge
                        mt={2}
                        colorScheme={
                          COMMENT_ROLE_COLOR[comment.author?.role ?? ""] ||
                          "gray"
                        }
                      >
                        {comment.author?.role || "SIN ROL"}
                      </Badge>
                      <Text mt={2} whiteSpace="pre-wrap">
                        {comment.content}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Text color="gray.400">Aún no hay comentarios.</Text>
              )}

              {canComment && (
                <Box mt={6}>
                  <form onSubmit={handleSubmitComment}>
                    <VStack align="stretch" spacing={3}>
                      <Textarea
                        placeholder="Escribe un comentario..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={4}
                      />
                      <Button
                        colorScheme="teal"
                        type="submit"
                        isLoading={commentSubmitting}
                        isDisabled={commentSubmitting}
                      >
                        Enviar comentario
                      </Button>
                    </VStack>
                  </form>
                </Box>
              )}
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
