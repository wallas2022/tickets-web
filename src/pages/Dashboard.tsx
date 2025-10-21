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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { api } from "../api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [role, setRole] = useState<string>("");
  const navigator = useNavigate();

  const cardBg = useColorModeValue("gray.100", "gray.700");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setRole(payload.role);
    }

    api.get("/tickets/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!stats) return <p>Cargando estadísticas...</p>;

  const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE"];

  return (
    <Box p={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Panel de Estadísticas</Heading>
        <Button
          colorScheme="teal"
          variant="outline"
          onClick={() => navigator("/")}
        >
          ← Regresar a Tickets
        </Button>
      </Flex>

      {/* Si es ADMIN, muestra todos los usuarios */}
      {role === "ADMIN" && (
        <SimpleGrid columns={[1, 2, 3]} spacing={6} mb={8}>
          {stats.userStats.map((u: any) => (
            <Box key={u.name} bg={cardBg} p={4} rounded="md" shadow="md">
              <Stat>
                <StatLabel>{u.name}</StatLabel>
                <StatNumber>{u.tickets}</StatNumber>
              </Stat>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {/* Gráfica de estados */}
      <Box bg={cardBg} p={6} rounded="md" shadow="md" height="400px">
        <Heading size="md" mb={4}>
          Tickets por estado
        </Heading>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={stats.ticketsByStatus.map((s: any) => ({
                name: s.status,
                value: s._count?.id || s._count,
              }))}
              dataKey="value"
              nameKey="name"
              label
            >
              {stats.ticketsByStatus.map((_: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
