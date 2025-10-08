import {
  Flex,
  Button,
  Heading,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

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
        <Button onClick={toggleColorMode}>
          {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
        </Button>
        <Button colorScheme="red" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </Flex>
    </Flex>
  );
}
