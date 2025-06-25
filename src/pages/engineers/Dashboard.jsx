import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Plus,
  User,
  Phone,
  LogOut,
  History,
  ShoppingCart,
  Wrench,
} from "lucide-react";
import { supabase } from "../config/supabase"; // tu cliente de supabase
import { Link, useNavigate } from "react-router-dom";

export const DashboardPage = ({ email, uid }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!uid) return;

    const fetchClientes = async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("userId", uid);

      if (error) {
        console.error("Error al obtener clientes:", error);
        return;
      }

      setClientes(data || []);
    };

    fetchClientes();
  }, [uid]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.telefono.trim()) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      const { error } = await supabase.from("clientes").insert([
        {
          nombre: formData.nombre.trim(),
          telefono: formData.telefono.trim(),
          userId: uid,
        },
      ]);

      if (error) throw error;

      setFormData({ nombre: "", telefono: "" });
      setIsDialogOpen(false);

      // Recargar clientes
      const { data: updatedClientes } = await supabase
        .from("clientes")
        .select("*")
        .eq("userId", uid);
      setClientes(updatedClientes || []);
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      alert("Error al guardar el cliente");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Probe<span className="text-[#eb545f]">Care</span>
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Bienvenido, {email}</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Gestión de Clientes
              </h2>
              <p className="text-gray-600">Administra tu base de clientes</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
                  <DialogDescription>
                    Ingresa la información del cliente para registrarlo.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-2 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nombre">Nombre completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="nombre"
                          placeholder="Nombre del cliente"
                          value={formData.nombre}
                          onChange={(e) => handleInputChange("nombre", e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="telefono">Número de teléfono</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="telefono"
                          type="tel"
                          placeholder="Ej: +9611235678"
                          value={formData.telefono}
                          onChange={(e) => handleInputChange("telefono", e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Registrar Cliente</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Lista de clientes */}
        <div className="grid gap-4">
          {clientes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay clientes registrados
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  Comienza registrando tu primer cliente.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clientes.map((cliente) => (
                <Card key={cliente.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {cliente.nombre}
                    </CardTitle>
                    <CardDescription>
                      Número de contacto: {cliente.telefono}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <Link
                          to={`/cliente/${cliente.id}`}
                          className="flex items-center w-full justify-center"
                        >
                          <History className="w-4 h-4 mr-2" />
                          Ver historial
                        </Link>
                      </Button>

                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">
                          <Link
                            to={`/cliente/${cliente.id}/venta`}
                            className="flex items-center w-full justify-center"
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Venta
                          </Link>
                        </Button>

                        <Button variant="outline" size="sm">
                          <Wrench className="w-4 h-4 mr-1" />
                          Servicio
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
