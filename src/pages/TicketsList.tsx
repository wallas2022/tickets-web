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
} from "@chakra-ui/react";
import Navbar from "../components/Navbar";
import { useTickets, useCreateTicket } from "../hooks/useTickets";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api";
import { useQueryClient } from "@tanstack/react-query";

export default function TicketsList() {
  const { data: tickets, isLoading } = useTickets();
  const createTicket = useCreateTicket();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [selected, setSelected] = useState<any>(null);

  const [role, setRole] = useState<string>("");

useEffect(() => {
  const token = localStorage.getItem("access_token");
  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    setRole(payload.role);
  }
}, []);

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

  const openTicket = (t: any) => {
    setSelected(t);
    onDrawerOpen();
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
          onModalClose();
        },
        onError: () => toast.error("Error al crear el ticket ❌"),
      }
    );
  };

  const queryClient = useQueryClient();
    const [statusLocal, setStatusLocal] = useState<string>("OPEN");
    // cada vez que cambie el ticket seleccionado, sincroniza el select
    useEffect(() => {
      if (selected?.status) setStatusLocal(selected.status);
    }, [selected]);

    // el rol del usuario en contexto, aquí.
    // por ahora, permitimos siempre el cambio (ajústalo a tu auth real)
    const puedeCambiarEstado = true;
    const handleChangeStatus = async (newStatus: string) => {
      if (!selected?.id) return;
      try {
        // Algunas APIs esperan PATCH /tickets/:id con { status }.
        // Si tu backend sí expone /status, deja tu ruta original.
        await api.patch(`/tickets/${selected.id}/status`, { status: newStatus });

        // Actualiza UI local:
        setStatusLocal(newStatus);
        setSelected((prev: any) => (prev ? { ...prev, status: newStatus } : prev));

        // Invalida/actualiza cache del listado si usas React Query:
        queryClient.invalidateQueries({ queryKey: ["tickets"] });

        toast.success("Estado actualizado ✅");
      } catch (e) {
        toast.error("Error al actualizar estado ❌");
      }
    };

    const [agents, setAgents] = useState<any[]>([]);

// Cargar lista de agentes cuando el rol es ADMIN
useEffect(() => {
  if (role === "ADMIN") {
    api.get("/users?role=AGENT") // 🔹 Ajusta según tu endpoint real
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
  } catch {
    toast.error("Error al asignar ticket ❌");
  }
};


  return (
    <Box minH="100vh">
      <Navbar />
      <Box p={8}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading>Mis Tickets</Heading>
         {role === "CUSTOMER" && (
  <Button colorScheme="teal" onClick={onModalOpen}>
    + Nuevo Ticket
  </Button>
)}
        </Flex>

        {/* Listado */}
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
            ))}
          </VStack>
        )}

        {/* Drawer de detalles */}
       <Drawer isOpen={isDrawerOpen} placement="right" onClose={onDrawerClose} size="md">
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

      {/* Estado visible siempre */}
      <Text mb={2}><b>Estado actual:</b> {statusLocal}</Text>
      <Text mb={2}>
  <b>Creado por:</b> {selected?.author?.name || "Desconocido"}
</Text>
<Text mb={2}>
  <b>Asignado a:</b> {selected?.assignee?.name || "No asignado"}
</Text>

      {/* Selector CONTROLADO y DENTRO del Drawer */}
      {puedeCambiarEstado && (
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
      )}

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
