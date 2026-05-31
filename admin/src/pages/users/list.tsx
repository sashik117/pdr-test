import { useTable } from "@refinedev/core";
import { useNavigate } from "react-router";
import { User } from "../../types/user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Edit,
  Eye,
  Trash2,
  Plus,
  Search,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import type { CrudFilters } from "@refinedev/core";

export const UserList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("");
  const [current, setCurrent] = useState(1);
  const pageSize = 10;

  const filters: CrudFilters = [
    ...(searchTerm
      ? [{ field: "q", operator: "contains" as const, value: searchTerm }]
      : []),
    ...(roleFilter && roleFilter !== "all"
      ? [{ field: "role", operator: "eq" as const, value: roleFilter }]
      : []),
    ...(verifiedFilter && verifiedFilter !== "all"
      ? [
          {
            field: "emailVerified",
            operator: "eq" as const,
            value: verifiedFilter === "true",
          },
        ]
      : []),
  ];

  const { tableQuery } = useTable<User>({
    resource: "users",
    filters: {
      permanent: filters,
    },
    pagination: {
      mode: "server",
      pageSize,
    },
  });

  const users = tableQuery.data?.data ?? [];
  const total = tableQuery.data?.total ?? 0;
  const pageCount = Math.ceil(total / pageSize);

  const handleDelete = async (id: string) => {
    if (window.confirm("Ви впевнені, що хочете видалити цього користувача?")) {
      try {
        const token = localStorage.getItem("admin_token");
        await fetch(`http://localhost:3001/api/admin/users/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        tableQuery.refetch();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Помилка при видаленні користувача");
      }
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Користувачі</h1>
          <p className="text-muted-foreground">
            Керування користувачами системи
          </p>
        </div>
        <Button onClick={() => navigate("/users/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Додати користувача
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Фільтри</CardTitle>
          <CardDescription>
            Знайдіть потрібних користувачів за допомогою фільтрів
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Пошук за email або ім'ям..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі ролі</SelectItem>
                <SelectItem value="admin">Адміністратор</SelectItem>
                <SelectItem value="user">Користувач</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Email підтверджено" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі</SelectItem>
                <SelectItem value="true">Підтверджено</SelectItem>
                <SelectItem value="false">Не підтверджено</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Ім'я</TableHead>
                <TableHead className="w-[120px]">Роль</TableHead>
                <TableHead className="w-[140px]">Email підтверджено</TableHead>
                <TableHead className="w-[180px]">Дата реєстрації</TableHead>
                <TableHead className="w-[150px] text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Завантаження...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Користувачі не знайдені
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      {user.role === "admin" ? (
                        <Badge variant="default" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Адмін
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <UserIcon className="h-3 w-3" />
                          Користувач
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.emailVerified ? (
                        <Badge variant="default" className="bg-green-600">
                          Так
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Ні</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("uk-UA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            user.id && navigate(`/users/show/${user.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            user.id && navigate(`/users/edit/${user.id}`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            user.id && handleDelete(String(user.id))
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pageCount > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Показано {(current - 1) * pageSize + 1} -{" "}
            {Math.min(current * pageSize, total)} з {total}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrent(current - 1)}
              disabled={current === 1}
            >
              Попередня
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: pageCount }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === pageCount ||
                    Math.abs(page - current) <= 2
                )
                .map((page, index, array) => {
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;
                  return (
                    <>
                      {showEllipsis && (
                        <span key={`ellipsis-${page}`} className="px-2">
                          ...
                        </span>
                      )}
                      <Button
                        key={page}
                        variant={current === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrent(page)}
                      >
                        {page}
                      </Button>
                    </>
                  );
                })}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrent(current + 1)}
              disabled={current === pageCount}
            >
              Наступна
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
