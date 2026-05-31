import { useShow, useNavigation } from "@refinedev/core";
import { useParams } from "react-router";
import { User } from "../../types/user";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Badge } from "../../components/ui/badge";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/admin";

export const UserShow = () => {
  const { id } = useParams();
  const { list, edit } = useNavigation();
  const { query } = useShow<User>({
    resource: "users",
    id,
  });

  const { data, isLoading } = query;
  const user = data?.data;

  const handleDelete = async () => {
    if (window.confirm("Ви впевнені, що хочете видалити цього користувача?")) {
      try {
        const token = localStorage.getItem("admin_token");
        await fetch(`${API_URL}/users/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        list("users");
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          Завантаження...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          Користувача не знайдено
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => list("users")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Перегляд користувача</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => edit("users", id!)}>
            <Edit className="mr-2 h-4 w-4" />
            Редагувати
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Видалити
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Основна інформація</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Роль</p>
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role === "admin" ? "Адміністратор" : "Користувач"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ID</p>
              <p className="font-mono text-sm">{user.id}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Дати</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Створено</p>
              <p className="font-semibold">
                {user.createdAt ? new Date(user.createdAt).toLocaleString("uk-UA") : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Оновлено</p>
              <p className="font-semibold">
                {user.updatedAt ? new Date(user.updatedAt).toLocaleString("uk-UA") : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
