import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  Download,
  Upload,
  Trash2,
  Calendar as CalendarIcon,
  Home,
  Clock,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import { useApp } from '../App';

export default function Settings() {
  const { settings, updateSettings, tasks, events, notes } = useApp();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportData = () => {
    setIsExporting(true);
    
    try {
      const data = {
        tasks,
        events,
        notes,
        settings,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `생산성앱_백업_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('데이터가 성공적으로 내보내졌습니다.');
    } catch (error) {
      toast.error('데이터 내보내기에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.tasks && data.events && data.notes && data.settings) {
          // Update localStorage directly
          localStorage.setItem('productivity-app-tasks', JSON.stringify(data.tasks));
          localStorage.setItem('productivity-app-events', JSON.stringify(data.events));
          localStorage.setItem('productivity-app-notes', JSON.stringify(data.notes));
          localStorage.setItem('productivity-app-settings', JSON.stringify(data.settings));
          
          toast.success('데이터가 성공적으로 가져와졌습니다. 페이지를 새로고침하세요.');
        } else {
          toast.error('잘못된 백업 파일 형식입니다.');
        }
      } catch (error) {
        toast.error('파일을 읽는 중 오류가 발생했습니다.');
      } finally {
        setIsImporting(false);
        // Reset file input
        event.target.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (window.confirm('모든 데이터가 삭제됩니다. 정말 초기화하시겠습니까?')) {
      localStorage.removeItem('productivity-app-tasks');
      localStorage.removeItem('productivity-app-events');
      localStorage.removeItem('productivity-app-notes');
      localStorage.removeItem('productivity-app-settings');
      
      toast.success('데이터가 초기화되었습니다. 페이지를 새로고침하세요.');
    }
  };

  const themeOptions = [
    { value: 'light', label: '라이트', icon: Sun },
    { value: 'dark', label: '다크', icon: Moon },
    { value: 'system', label: '시스템', icon: Monitor }
  ];

  const startPageOptions = [
    { value: 'dashboard', label: '대시보드', icon: Home },
    { value: 'tasks', label: '할 일', icon: CalendarIcon }
  ];

  const stats = {
    totalTasks: tasks.length,
    totalEvents: events.length,
    totalNotes: notes.length,
    completedTasks: tasks.filter(task => task.status === 'done').length
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 space-y-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">설정</h1>
        <p className="text-muted-foreground">앱 설정과 데이터를 관리하세요.</p>
      </div>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Monitor className="mr-2 h-5 w-5" />
            화면 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="theme">테마</Label>
              <p className="text-sm text-muted-foreground">앱의 색상 테마를 선택하세요</p>
            </div>
            <Select
              value={settings.theme}
              onValueChange={(value: 'light' | 'dark' | 'system') => 
                updateSettings({ theme: value })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        <Icon className="mr-2 h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="focusMode">포커스 모드</Label>
              <p className="text-sm text-muted-foreground">애니메이션을 줄여 집중력을 높입니다</p>
            </div>
            <Switch
              id="focusMode"
              checked={settings.focusMode}
              onCheckedChange={(checked) => updateSettings({ focusMode: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="mr-2 h-5 w-5" />
            앱 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="startPage">시작 페이지</Label>
              <p className="text-sm text-muted-foreground">앱을 열 때 보여질 페이지</p>
            </div>
            <Select
              value={settings.startPage}
              onValueChange={(value: 'dashboard' | 'tasks') => 
                updateSettings({ startPage: value })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {startPageOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        <Icon className="mr-2 h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weekStart">주 시작 요일</Label>
              <p className="text-sm text-muted-foreground">캘린더에서 주의 시작 요일</p>
            </div>
            <Select
              value={settings.weekStartsOn.toString()}
              onValueChange={(value) => 
                updateSettings({ weekStartsOn: parseInt(value) as 0 | 1 })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">일요일</SelectItem>
                <SelectItem value="1">월요일</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="timeFormat">시간 형식</Label>
              <p className="text-sm text-muted-foreground">시간 표시 형식</p>
            </div>
            <Select
              value={settings.timeFormat}
              onValueChange={(value: '12' | '24') => 
                updateSettings({ timeFormat: value })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12시간</SelectItem>
                <SelectItem value="24">24시간</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="mr-2 h-5 w-5" />
            사용 통계
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold text-blue-600">{stats.totalTasks}</div>
              <div className="text-sm text-muted-foreground">전체 할 일</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
              <div className="text-sm text-muted-foreground">완료한 할 일</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold text-purple-600">{stats.totalEvents}</div>
              <div className="text-sm text-muted-foreground">전체 일정</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold text-orange-600">{stats.totalNotes}</div>
              <div className="text-sm text-muted-foreground">전체 메모</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5" />
            데이터 관리
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              모든 데이터는 브라우저의 LocalStorage에 저장됩니다. 
              데이터 손실을 방지하기 위해 정기적으로 백업해주세요.
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleExportData}
              disabled={isExporting}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? '내보내는 중...' : '데이터 내보내기'}
            </Button>
            
            <div className="flex-1">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
                id="import-file"
                disabled={isImporting}
              />
              <Button
                asChild
                variant="outline"
                disabled={isImporting}
                className="w-full"
              >
                <label htmlFor="import-file" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  {isImporting ? '가져오는 중...' : '데이터 가져오기'}
                </label>
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <Button
              variant="destructive"
              onClick={handleResetData}
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              모든 데이터 초기화
            </Button>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              이 작업은 되돌릴 수 없습니다. 백업을 먼저 만드세요.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            키보드 단축키
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span>명령 팔레트 열기</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘/Ctrl + K</kbd>
            </div>
            <div className="flex justify-between">
              <span>새 할 일 추가</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘/Ctrl + T</kbd>
            </div>
            <div className="flex justify-between">
              <span>새 일정 추가</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘/Ctrl + E</kbd>
            </div>
            <div className="flex justify-between">
              <span>새 메모 추가</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘/Ctrl + N</kbd>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <p className="text-sm">
            생산성 올인원 앱 v1.0.0
          </p>
          <p className="text-xs mt-1">
            LocalStorage 기반 할 일 관리, 캘린더, 메모 통합 앱
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}