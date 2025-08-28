import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Calendar as CalendarIcon,
  Tag,
  AlertCircle,
  Clock,
  CheckSquare2,
  Square,
  Circle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useApp, Task } from '../App';
import { format, isToday, parseISO, isPast } from 'date-fns';
import { ko } from 'date-fns/locale';

const priorityColors = {
  P1: 'destructive',
  P2: 'default',
  P3: 'secondary'
} as const;

const statusIcons = {
  todo: Square,
  'in-progress': Circle,
  done: CheckSquare2
};

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach(task => task.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!task.title.toLowerCase().includes(query) && 
            !task.description.toLowerCase().includes(query) &&
            !task.tags.some(tag => tag.toLowerCase().includes(query))) {
          return false;
        }
      }

      // Tag filter
      if (selectedTags.length > 0) {
        if (!selectedTags.some(tag => task.tags.includes(tag))) {
          return false;
        }
      }

      // Priority filter
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && task.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, selectedTags, selectedPriority, selectedStatus]);

  // Get today's tasks
  const todaysTasks = useMemo(() => {
    return tasks.filter(task => 
      task.dueDate && isToday(parseISO(task.dueDate))
    );
  }, [tasks]);

  // Get overdue tasks
  const overdueTasks = useMemo(() => {
    return tasks.filter(task => 
      task.dueDate && 
      isPast(parseISO(task.dueDate)) && 
      !isToday(parseISO(task.dueDate)) &&
      task.status !== 'done'
    );
  }, [tasks]);

  // Group tasks by status for Kanban view
  const tasksByStatus = useMemo(() => {
    return {
      todo: filteredTasks.filter(task => task.status === 'todo'),
      'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
      done: filteredTasks.filter(task => task.status === 'done')
    };
  }, [filteredTasks]);

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    addTask(taskData);
    setIsAddDialogOpen(false);
  };

  const handleEditTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      setEditingTask(null);
    }
  };

  const handleTaskStatusChange = (taskId: string, status: Task['status']) => {
    updateTask(taskId, { status });
  };

  const TaskCard = ({ task, isDraggable = false }: { task: Task; isDraggable?: boolean }) => {
    const StatusIcon = statusIcons[task.status];
    const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate)) && task.status !== 'done';

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="group"
      >
        <Card className={`cursor-pointer hover:shadow-md transition-all ${isOverdue ? 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/50' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto"
                  onClick={() => {
                    const newStatus = task.status === 'done' ? 'todo' : 
                                   task.status === 'todo' ? 'in-progress' : 'done';
                    handleTaskStatusChange(task.id, newStatus);
                  }}
                >
                  <StatusIcon className={`h-4 w-4 ${task.status === 'done' ? 'text-green-500' : 'text-muted-foreground'}`} />
                </Button>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {isOverdue && <AlertCircle className="h-4 w-4 text-red-500" />}
                      <Badge variant={priorityColors[task.priority]} className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {task.dueDate && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                        {format(parseISO(task.dueDate), 'PPP', { locale: ko })}
                      </span>
                    </div>
                  )}

                  {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="mr-1 h-2 w-2" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setEditingTask(task)}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const TaskForm = ({ 
    task, 
    onSubmit, 
    onCancel 
  }: { 
    task?: Task; 
    onSubmit: (data: any) => void; 
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'P2',
      status: task?.status || 'todo',
      dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
      tags: task?.tags.join(', ') || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      onSubmit({
        ...formData,
        tags,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">제목</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="할 일 제목을 입력하세요"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">설명</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="할 일에 대한 설명을 입력하세요"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="priority">우선순위</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: 'P1' | 'P2' | 'P3') => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P1">P1 (높음)</SelectItem>
                <SelectItem value="P2">P2 (보통)</SelectItem>
                <SelectItem value="P3">P3 (낮음)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">상태</Label>
            <Select
              value={formData.status}
              onValueChange={(value: Task['status']) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">할 일</SelectItem>
                <SelectItem value="in-progress">진행 중</SelectItem>
                <SelectItem value="done">완료</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="dueDate">마감일</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="업무, 개인, 중요"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          {task && (
            <Button 
              type="button" 
              variant="destructive"
              onClick={() => {
                deleteTask(task.id);
                onCancel();
              }}
            >
              삭제
            </Button>
          )}
          <Button type="submit">
            {task ? '수정' : '추가'}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">할 일</h1>
          <p className="text-muted-foreground">
            전체 {tasks.length}개 • 완료 {tasks.filter(t => t.status === 'done').length}개
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              할 일 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>새 할 일 추가</DialogTitle>
            </DialogHeader>
            <TaskForm 
              onSubmit={handleAddTask}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="할 일 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="우선순위" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 우선순위</SelectItem>
                  <SelectItem value="P1">P1 (높음)</SelectItem>
                  <SelectItem value="P2">P2 (보통)</SelectItem>
                  <SelectItem value="P3">P3 (낮음)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="todo">할 일</SelectItem>
                  <SelectItem value="in-progress">진행 중</SelectItem>
                  <SelectItem value="done">완료</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                >
                  <Tag className="mr-1 h-2 w-2" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">목록</TabsTrigger>
          <TabsTrigger value="kanban">칸반</TabsTrigger>
          <TabsTrigger value="today">오늘</TabsTrigger>
          <TabsTrigger value="all">전체</TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckSquare2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">할 일이 없습니다</h3>
                <p className="text-muted-foreground">새로운 할 일을 추가해보세요.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* Kanban View */}
        <TabsContent value="kanban">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(tasksByStatus).map(([status, tasks]) => (
              <Card key={status}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {status === 'todo' ? '할 일' : 
                     status === 'in-progress' ? '진행 중' : '완료'}
                    <Badge variant="secondary" className="ml-2">
                      {tasks.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <AnimatePresence>
                    {tasks.map((task) => (
                      <TaskCard key={task.id} task={task} isDraggable />
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Today View */}
        <TabsContent value="today" className="space-y-4">
          {overdueTasks.length > 0 && (
            <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/50">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  지연된 할 일 ({overdueTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <AnimatePresence>
                  {overdueTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                오늘 할 일 ({todaysTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todaysTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckSquare2 className="mx-auto h-12 w-12 mb-4 opacity-20" />
                  <p>오늘 할 일이 없습니다</p>
                </div>
              ) : (
                <AnimatePresence>
                  {todaysTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All View */}
        <TabsContent value="all" className="space-y-4">
          <div className="space-y-3">
            <AnimatePresence>
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>할 일 수정</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskForm 
              task={editingTask}
              onSubmit={handleEditTask}
              onCancel={() => setEditingTask(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}