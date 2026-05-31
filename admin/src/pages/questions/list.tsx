import { useTable } from "@refinedev/core";
import { useNavigate } from "react-router";
import { Question } from "../../types/question";
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
import { Edit, Eye, Trash2, Plus, Search } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import type { CrudFilters } from "@refinedev/core";

export const QuestionList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [ticketFilter, setTicketFilter] = useState<string>("");
  const [current, setCurrent] = useState(1);
  const pageSize = 10;

  const filters: CrudFilters = [
    ...(searchTerm
      ? [{ field: "q", operator: "contains" as const, value: searchTerm }]
      : []),
    ...(categoryFilter
      ? categoryFilter !== "all"
        ? [
            {
              field: "category",
              operator: "eq" as const,
              value: categoryFilter,
            },
          ]
        : []
      : []),
    ...(ticketFilter
      ? [
          {
            field: "ticketNumber",
            operator: "eq" as const,
            value: parseInt(ticketFilter),
          },
        ]
      : []),
  ];

  const { tableQuery } = useTable<Question>({
    resource: "questions",
    filters: {
      permanent: filters,
    },
    pagination: {
      mode: "server",
      pageSize,
    },
  });

  const questions = tableQuery.data?.data ?? [];
  const total = tableQuery.data?.total ?? 0;
  const pageCount = Math.ceil(total / pageSize);

  const handleDelete = async (id: string) => {
    if (window.confirm("Ви впевнені, що хочете видалити це питання?")) {
      try {
        await fetch(`http://localhost:3001/api/admin/questions/${id}`, {
          method: "DELETE",
        });
        tableQuery.refetch();
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Питання ПДР</h1>
          <p className="text-muted-foreground">
            Керування базою питань для тестування
          </p>
        </div>
        <Button onClick={() => navigate("/questions/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Додати питання
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Фільтри</CardTitle>
          <CardDescription>
            Знайдіть потрібні питання за допомогою фільтрів
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Пошук по тексту..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Категорія" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі категорії</SelectItem>
                <SelectItem value="ПДР України">ПДР України</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Номер білета"
              value={ticketFilter}
              onChange={(e) => setTicketFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="w-[100px]">Білет</TableHead>
                <TableHead className="w-[80px]">№</TableHead>
                <TableHead>Текст питання</TableHead>
                <TableHead className="w-[100px]">Зображення</TableHead>
                <TableHead className="w-[120px]">Правильна відповідь</TableHead>
                <TableHead className="w-[150px] text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Завантаження...
                  </TableCell>
                </TableRow>
              ) : questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Питання не знайдено
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-mono text-xs">
                      {question.questionId}
                    </TableCell>
                    <TableCell>{question.ticketNumber}</TableCell>
                    <TableCell>{question.questionNumber}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {question.text}
                    </TableCell>
                    <TableCell>
                      {question.imageUrl ? (
                        <img
                          src={`http://localhost:3001${question.imageUrl}`}
                          alt="Question"
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Немає
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {question.correctAnswer}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            question.id &&
                            navigate(`/questions/show/${question.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            question.id &&
                            navigate(`/questions/edit/${question.id}`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            question.id && handleDelete(String(question.id))
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
