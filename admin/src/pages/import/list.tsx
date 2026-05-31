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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  BookOpen,
  FileQuestion,
} from "lucide-react";

interface ImportLog {
  id: string;
  startedAt: string;
  completedAt?: string;
  status: "running" | "completed" | "failed";
  questionsImported: number;
  imagesDownloaded: number;
  errorsCount: number;
}

interface ImportStatus {
  id: string;
  startedAt: string;
  completedAt?: string;
  status: "running" | "completed" | "failed";
  questionsImported: number;
  imagesDownloaded: number;
  errorsCount: number;
  logsCount: number;
}

interface TheoryParseStatus {
  isRunning: boolean;
  startedAt: string | null;
  completedAt: string | null;
  logs: string[];
  error: string | null;
  result: {
    chapters: number;
    signs: number;
    markings: number;
    images: number;
  } | null;
}

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api/admin";

export const ImportList = () => {
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingImport, setStartingImport] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<ImportStatus | null>(null);

  const [theoryStatus, setTheoryStatus] = useState<TheoryParseStatus | null>(
    null
  );
  const [startingTheoryImport, setStartingTheoryImport] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_URL}/import/logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setLogs(data.logs || []);

      const runningLog = data.logs?.find(
        (l: ImportLog) => l.status === "running"
      );
      if (runningLog) {
        setCurrentJobId(runningLog.id);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    if (!currentJobId) return;

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(
        `${API_URL}/import/status?jobId=${currentJobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setCurrentStatus(data);

      if (data.status !== "running") {
        setCurrentJobId(null);
        fetchLogs();
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  }, [currentJobId, fetchLogs]);

  const fetchTheoryStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_URL}/theory/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTheoryStatus(data);
    } catch (error) {
      console.error("Error fetching theory status:", error);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchTheoryStatus();
  }, [fetchLogs, fetchTheoryStatus]);

  useEffect(() => {
    if (currentJobId) {
      const interval = setInterval(fetchStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [currentJobId, fetchStatus]);

  useEffect(() => {
    if (theoryStatus?.isRunning) {
      const interval = setInterval(fetchTheoryStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [theoryStatus?.isRunning, fetchTheoryStatus]);

  const startImport = async () => {
    setStartingImport(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_URL}/import/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.statusMessage || "Failed to start import");
      }

      const data = await response.json();
      setCurrentJobId(data.jobId);
      setCurrentStatus({
        id: data.jobId,
        startedAt: new Date().toISOString(),
        status: "running",
        questionsImported: 0,
        imagesDownloaded: 0,
        errorsCount: 0,
        logsCount: 0,
      });
    } catch (error: any) {
      alert(error.message || "Failed to start import");
    } finally {
      setStartingImport(false);
    }
  };

  const startTheoryImport = async () => {
    setStartingTheoryImport(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_URL}/theory/parse`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.statusMessage || "Failed to start theory import");
      }

      await fetchTheoryStatus();
    } catch (error: any) {
      alert(error.message || "Failed to start theory import");
    } finally {
      setStartingTheoryImport(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("uk-UA");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Виконується
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Завершено
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <XCircle className="w-3 h-3 mr-1" />
            Помилка
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Імпорт даних</h1>
      </div>

      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <FileQuestion className="w-4 h-4" />
            Питання
          </TabsTrigger>
          <TabsTrigger value="theory" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Теорія
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={fetchLogs} disabled={loading}>
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Оновити
            </Button>
            <Button
              onClick={startImport}
              disabled={startingImport || !!currentJobId}
            >
              {startingImport ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Запустити імпорт
            </Button>
          </div>

          {currentStatus && currentStatus.status === "running" && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  Імпорт виконується...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Питань імпортовано</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {currentStatus.questionsImported}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Зображень завантажено
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {currentStatus.imagesDownloaded}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Помилок</p>
                    <p className="text-2xl font-bold text-red-600">
                      {currentStatus.errorsCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Історія імпортів</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Імпортів ще не було</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Питань</TableHead>
                      <TableHead>Зображень</TableHead>
                      <TableHead>Помилок</TableHead>
                      <TableHead>Тривалість</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDate(log.startedAt)}</TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell>{log.questionsImported}</TableCell>
                        <TableCell>{log.imagesDownloaded}</TableCell>
                        <TableCell
                          className={
                            log.errorsCount > 0
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          {log.errorsCount}
                        </TableCell>
                        <TableCell>
                          {log.completedAt
                            ? `${Math.round(
                                (new Date(log.completedAt).getTime() -
                                  new Date(log.startedAt).getTime()) /
                                  1000 /
                                  60
                              )} хв`
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theory" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={fetchTheoryStatus}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Оновити
            </Button>
            <Button
              onClick={startTheoryImport}
              disabled={startingTheoryImport || theoryStatus?.isRunning}
            >
              {startingTheoryImport || theoryStatus?.isRunning ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Запустити парсинг теорії
            </Button>
          </div>

          {theoryStatus?.isRunning && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  Парсинг теорії виконується...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-60 overflow-y-auto bg-white rounded p-3 font-mono text-sm">
                  {theoryStatus.logs.slice(-20).map((log, idx) => (
                    <div key={idx} className="text-gray-700">
                      {log}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {theoryStatus?.result && !theoryStatus.isRunning && (
            <Card
              className={
                theoryStatus.error
                  ? "border-red-200 bg-red-50"
                  : "border-green-200 bg-green-50"
              }
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  {theoryStatus.error ? (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      Парсинг завершено з помилками
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Парсинг успішно завершено
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Розділів ПДР</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {theoryStatus.result.chapters}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Дорожніх знаків</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {theoryStatus.result.signs}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Розміток</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {theoryStatus.result.markings}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Зображень</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {theoryStatus.result.images}
                    </p>
                  </div>
                </div>
                {theoryStatus.completedAt && (
                  <p className="text-sm text-gray-500 mt-4">
                    Завершено: {formatDate(theoryStatus.completedAt)}
                  </p>
                )}
                {theoryStatus.error && (
                  <p className="text-sm text-red-600 mt-2">
                    Помилка: {theoryStatus.error}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {!theoryStatus?.isRunning && !theoryStatus?.result && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>
                    Натисніть "Запустити парсинг теорії" для імпорту розділів
                    ПДР, знаків та розмітки
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
