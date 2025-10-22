import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  useColorModeValue,
  Flex,
  Text,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      direction="column"
      align="center"
      justify="center"
      h="100vh"
      bg={useColorModeValue("gray.50", "gray.900")}
      gap={6}
    >
      {/* 🔹 Título principal fuera del box */}
      <Heading size="2xl" color={useColorModeValue("gray.800", "white")}>
        Sistema de Tickets 🎟️
      </Heading>

      {/* 🔹 Caja con el formulario */}
      <Box
        bg={useColorModeValue("white", "gray.800")}
        p={10}
        rounded="2xl"
        shadow="2xl"
        w="sm"
        textAlign="center"
      >
        <Heading size="lg" mb={6}>
          Iniciar sesión
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              focusBorderColor="teal.400"
              required
            />

            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                focusBorderColor="teal.400"
                required
              />
              <InputRightElement>
                <IconButton
                  variant="ghost"
                  size="sm"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowPassword(!showPassword)}
                />
              </InputRightElement>
            </InputGroup>

            <Button
              type="submit"
              colorScheme="teal"
              w="full"
              mt={2}
              size="md"
              fontWeight="bold"
            >
              Iniciar sesión
            </Button>
          </VStack>
        </form>
      </Box>

      {/* 🔹 Footer (fuera del box) */}
      <Text fontSize="sm" color="gray.500" mt={4}>
        © 2025 Galácticos S.A. — Todos los derechos reservados.
      </Text>
    </Flex>
  );
}