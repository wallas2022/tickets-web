import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: () => toast.success("Inicio de sesión exitoso 🎉"),
        onError: () => toast.error("Credenciales incorrectas ❌"),
      }
    );
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue("gray.100", "gray.800")}
    >
      <Box
        bg={useColorModeValue("white", "gray.700")}
        p={8}
        rounded="lg"
        boxShadow="lg"
        width="sm"
      >
        <Heading mb={6} textAlign="center">
          Iniciar Sesión
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
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
            <Button
              type="submit"
              colorScheme="teal"
              width="full"
              isLoading={login.isPending}
            >
              Entrar
            </Button>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
}
