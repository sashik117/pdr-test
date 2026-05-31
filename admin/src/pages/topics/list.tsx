import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { RefreshCw, Loader2, BookOpen, Star } from "lucide-react";

interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string;
  difficulty: number;
  questionCount: number;
  order: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const TopicList = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_URL}/topics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTopics(data.topics || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const getDifficultyBadge = (difficulty: number) => {
    const colors: Record<number, string> = {
      1: "bg-green-100 text-green-700 border-green-200",
      2: "bg-lime-100 text-lime-700 border-lime-200",
      3: "bg-yellow-100 text-yellow-700 border-yellow-200",
      4: "bg-orange-100 text-orange-700 border-orange-200",
      5: "bg-red-100 text-red-700 border-red-200",
    };

    const labels: Record<number, string> = {
      1: "Легко",
      2: "Нижче середнього",
      3: "Середній",
      4: "Вище середнього",
      5: "Складно",
    };

    return (
      <Badge variant="outline" className={colors[difficulty] || colors[3]}>
        <Star className="w-3 h-3 mr-1" />
        {labels[difficulty] || "Середній"}
      </Badge>
    );
  };

  const renderStars = (difficulty: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= difficulty
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const totalQuestions = topics.reduce((sum, t) => sum + t.questionCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Теми</h1>
        <Button variant="outline" onClick={fetchTopics} disabled={loading}>
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Оновити
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Всього тем
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{topics.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Всього питань
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalQuestions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Середня складність
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {topics.length > 0
                ? (
                    topics.reduce((sum, t) => sum + t.difficulty, 0) /
                    topics.length
                  ).toFixed(1)
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список тем</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Тем поки немає</p>
              <p className="text-sm mt-2">
                Запустіть імпорт питань для створення тем
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Назва</TableHead>
                  <TableHead>Опис</TableHead>
                  <TableHead>Складність</TableHead>
                  <TableHead className="text-right">Питань</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics
                  .sort((a, b) => a.order - b.order)
                  .map((topic) => (
                    <TableRow key={topic.id}>
                      <TableCell className="font-medium text-gray-500">
                        {topic.order}
                      </TableCell>
                      <TableCell className="font-medium">
                        {topic.name}
                      </TableCell>
                      <TableCell className="text-gray-600 max-w-md truncate">
                        {topic.description}
                      </TableCell>
                      <TableCell>{renderStars(topic.difficulty)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {topic.questionCount}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
