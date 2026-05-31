import { useShow, useUpdate, useNavigation } from "@refinedev/core";
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { User } from "../../types/user";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export const UserEdit = () => {
  const { id } = useParams();
  const { list } = useNavigation();
  const { query } = useShow<User>({
    resource: "users",
    id,
  });
  const { mutate } = useUpdate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading } = query;
  const user = data?.data;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        password: "",
        role: user.role || "user",
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: any = {
      email: formData.email,
      role: formData.role,
    };
    if (formData.password) {
      updateData.password = formData.password;
    }
    
    setIsSubmitting(true);
    mutate(
      {
        resource: "users",
        id: id!,
        values: updateData,
      },
      {
        onSuccess: () => {
          list("users");
        },
        onError: () => {
          setIsSubmitting(false);
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => list("users")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Редагувати користувача</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Данні користувача</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Новий пароль (залиште пустим, щоб не змінювати)</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Введіть новий пароль"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Роль</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Виберіть роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Користувач</SelectItem>
                  <SelectItem value="admin">Адміністратор</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? "Збереження..." : "Зберегти"}
              </Button>
              <Button type="button" variant="outline" onClick={() => list("users")}>
                Скасувати
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
