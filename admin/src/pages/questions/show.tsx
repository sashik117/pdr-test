import { useShow, useNavigation } from "@refinedev/core";
import { useParams } from "react-router";
import { Question } from "../../types/question";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Badge } from "../../components/ui/badge";

export const QuestionShow = () => {
  const { id } = useParams();
  const { list, edit } = useNavigation();
  const { query } = useShow<Question>({
    resource: "questions",
    id,
  });

  const { data, isLoading } = query;
  const question = data?.data;

  const handleDelete = async () => {
    if (window.confirm("Ви впевнені, що хочете видалити це питання?")) {
      try {
        await fetch(`http://localhost:3001/api/admin/questions/${id}`, {
          method: "DELETE",
        });
        list("questions");
      } catch (error) {
        console.error("Error deleting question:", error);
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

  if (!question) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          Питання не знайдено
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => list("questions")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Перегляд питання</h1>
            <p className="text-muted-foreground">
              {question.questionId} - Білет {question.ticketNumber}, Питання{" "}
              {question.questionNumber}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => edit("questions", id!)}>
            <Edit className="mr-2 h-4 w-4" />
            Редагувати
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Видалити
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Текст питання</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{question.text}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Варіанти відповідей</CardTitle>
              <CardDescription>
                Правильна відповідь:{" "}
                <Badge variant="default" className="ml-2">
                  {question.correctAnswer}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {question.options.map(
                  (option: { id: string; text: string }) => (
                    <div
                      key={option.id}
                      className={`p-4 rounded-lg border-2 ${
                        option.id === question.correctAnswer
                          ? "border-green-500 bg-green-50 dark:bg-green-950"
                          : "border-gray-200 dark:border-gray-800"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Badge
                          variant={
                            option.id === question.correctAnswer
                              ? "default"
                              : "outline"
                          }
                          className="mt-0.5"
                        >
                          {option.id}
                        </Badge>
                        <p className="flex-1">{option.text}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Пояснення</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {question.explanation || "Пояснення відсутнє"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {question.imageUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Зображення</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={`http://localhost:3001${question.imageUrl}`}
                  alt="Question illustration"
                  className="w-full rounded-lg border"
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Метадані</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">ID питання</p>
                <p className="font-mono text-sm">{question.questionId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Номер білета</p>
                <p className="font-semibold">{question.ticketNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Номер питання</p>
                <p className="font-semibold">{question.questionNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Категорія</p>
                <Badge variant="secondary">{question.category}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
