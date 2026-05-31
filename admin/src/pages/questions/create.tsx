import { useForm } from "@refinedev/react-hook-form";
import { useNavigation } from "@refinedev/core";
import { Question, QuestionOption } from "../../types/question";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export const QuestionCreate = () => {
  const { list } = useNavigation();
  const [options, setOptions] = useState<QuestionOption[]>([
    { id: "A", text: "" },
    { id: "B", text: "" },
    { id: "C", text: "" },
  ]);

  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<Question>({
    refineCoreProps: {
      resource: "questions",
      redirect: "list",
    },
  });

  const correctAnswer = watch("correctAnswer");

  const addOption = () => {
    const nextLetter = String.fromCharCode(65 + options.length);
    setOptions([...options, { id: nextLetter, text: "" }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      alert("Повинно бути мінімум 2 варіанти відповіді");
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const onSubmitHandler = async (data: any) => {
    const formData = {
      ...data,
      ticketNumber: parseInt(data.ticketNumber),
      questionNumber: parseInt(data.questionNumber),
      options: options.filter((opt) => opt.text.trim() !== ""),
    };

    await onFinish(formData);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => list("questions")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Створити питання</h1>
          <p className="text-muted-foreground">
            Додайте нове питання до бази даних
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Основна інформація</CardTitle>
                <CardDescription>
                  Заповніть основні дані про питання
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticketNumber">Номер білета *</Label>
                    <Input
                      id="ticketNumber"
                      type="number"
                      {...register("ticketNumber", {
                        required: "Номер білета обов'язковий",
                        min: { value: 1, message: "Мінімум 1" },
                        max: { value: 117, message: "Максимум 117" },
                      })}
                      placeholder="1-117"
                    />
                    {errors.ticketNumber && (
                      <p className="text-sm text-destructive">
                        {errors.ticketNumber.message?.toString()}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="questionNumber">Номер питання *</Label>
                    <Input
                      id="questionNumber"
                      type="number"
                      {...register("questionNumber", {
                        required: "Номер питання обов'язковий",
                        min: { value: 1, message: "Мінімум 1" },
                        max: { value: 20, message: "Максимум 20" },
                      })}
                      placeholder="1-20"
                    />
                    {errors.questionNumber && (
                      <p className="text-sm text-destructive">
                        {errors.questionNumber.message?.toString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text">Текст питання *</Label>
                  <Textarea
                    id="text"
                    {...register("text", {
                      required: "Текст питання обов'язковий",
                    })}
                    placeholder="Введіть текст питання..."
                    rows={4}
                  />
                  {errors.text && (
                    <p className="text-sm text-destructive">
                      {errors.text.message?.toString()}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL зображення</Label>
                  <Input
                    id="imageUrl"
                    {...register("imageUrl")}
                    placeholder="/images/questions/example.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Вкажіть шлях до зображення або залиште порожнім
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Варіанти відповідей</CardTitle>
                    <CardDescription>
                      Додайте мінімум 2 варіанти відповіді
                    </CardDescription>
                  </div>
                  <Button type="button" variant="outline" onClick={addOption}>
                    <Plus className="mr-2 h-4 w-4" />
                    Додати варіант
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {options.map((option, index) => (
                  <div key={option.id} className="flex gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-md border bg-muted font-semibold">
                      {option.id}
                    </div>
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Варіант ${option.id}`}
                      className="flex-1"
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Пояснення</CardTitle>
                <CardDescription>
                  Додайте детальне пояснення правильної відповіді
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...register("explanation")}
                  placeholder="Введіть пояснення з посиланнями на ПДР..."
                  rows={5}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Правильна відповідь *</CardTitle>
                <CardDescription>Виберіть правильний варіант</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  onValueChange={(value) => setValue("correctAnswer", value)}
                  value={correctAnswer}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Виберіть відповідь" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem
                        key={option.id}
                        value={option.id}
                        disabled={!option.text.trim()}
                      >
                        {option.id} - {option.text || "Порожній варіант"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.correctAnswer && (
                  <p className="text-sm text-destructive">
                    {errors.correctAnswer.message?.toString()}
                  </p>
                )}
                <input
                  type="hidden"
                  {...register("correctAnswer", {
                    required: "Оберіть правильну відповідь",
                  })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Категорія</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  onValueChange={(value) => setValue("category", value)}
                  defaultValue="ПДР України"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ПДР України">ПДР України</SelectItem>
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  {...register("category")}
                  value="ПДР України"
                />
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Збереження..." : "Створити питання"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => list("questions")}
                className="w-full"
              >
                Скасувати
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
