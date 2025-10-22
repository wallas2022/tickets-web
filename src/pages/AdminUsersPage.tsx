import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Select,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  useToast,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { api } from "../api";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [editingUser, setEditingUser] = useState<any>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch {
      toast({ title: "Error al cargar usuarios", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/users", { name, email, password, role });
      toast({ title: "Usuario creado con éxito ✅", status: "success" });
      setName("");
      setEmail("");
      setPassword("");
      setRole("CUSTOMER");
      loadUsers();
    } catch {
      toast({ title: "Error al crear usuario ❌", status: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast({ title: "Usuario eliminado ✅", status: "success" });
      loadUsers();
    } catch {
      toast({ title: "Error al eliminar usuario ❌", status: "error" });
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      await api.patch(`/users/${editingUser.id}`, {
        name,
        email,
        password: password || undefined,
        role,
      });
      toast({ title: "Usuario actualizado ✅", status: "success" });
      setEditingUser(null);
      setPassword("");
      loadUsers();
    } catch {
      toast({ title: "Error al actualizar usuario ❌", status: "error" });
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <Box minH="100vh">
      <Navbar />
      <Box p={8}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading>Administrar Usuarios</Heading>
          <Button variant="outline" colorScheme="teal" onClick={() => navigate("/")}>
            ← Regresar
          </Button>
        </Flex>

        {/* Formulario de creación */}
        <Box bg="gray.700" p={6} rounded="md" mb={8}>
          <Heading size="md" mb={4}>
            Crear nuevo usuario
          </Heading>
          <form onSubmit={handleCreate}>
            <VStack spacing={4} align="stretch">
              <Input
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                placeholder="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                placeholder="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="CUSTOMER">Cliente</option>
                <option value="AGENT">Agente</option>
                <option value="ADMIN">Administrador</option>
              </Select>
              <Button colorScheme="teal" type="submit">
                Crear Usuario
              </Button>
            </VStack>
          </form>
        </Box>

        {/* Tabla de usuarios */}
        {loading ? (
          <Spinner />
        ) : (
          <Table variant="simple" bg="gray.700" rounded="md">
            <Thead>
              <Tr>
                <Th color="white">Nombre</Th>
                <Th color="white">Correo</Th>
                <Th color="white">Rol</Th>
                <Th color="white" textAlign="center">
                  Acciones
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((u) => (
                <Tr key={u.id}>
                  <Td color="white">{u.name}</Td>
                  <Td color="white">{u.email}</Td>
                  <Td color="white">{u.role}</Td>
                  <Td textAlign="center">
                    <IconButton
                      icon={<EditIcon />}
                      colorScheme="yellow"
                      mr={2}
                      aria-label="Editar"
                      onClick={() => handleEdit(u)}
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      aria-label="Eliminar"
                      onClick={() => handleDelete(u.id)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}

        {/* Modal de edición */}
        <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)}>
          <ModalOverlay />
          <ModalContent bg="gray.800" color="white">
            <ModalHeader>Editar usuario</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Input
                  placeholder="Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  placeholder="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder="Nueva contraseña (opcional)"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="CUSTOMER">Cliente</option>
                  <option value="AGENT">Agente</option>
                  <option value="ADMIN">Administrador</option>
                </Select>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="teal" mr={3} onClick={handleUpdate}>
                Guardar cambios
              </Button>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancelar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
}
