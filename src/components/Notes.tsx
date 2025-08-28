import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Pin, 
  MoreVertical,
  Tag,
  Eye,
  Edit3,
  Hash
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { useApp, Note } from '../App';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  // Editor state
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(note => note.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [notes]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note =>
        selectedTags.some(tag => note.tags.includes(tag))
      );
    }

    // Sort: pinned first, then by updated date
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return parseISO(b.updatedAt).getTime() - parseISO(a.updatedAt).getTime();
    });
  }, [notes, searchQuery, selectedTags]);

  // Auto-save effect
  useEffect(() => {
    if (selectedNote && isEditing) {
      const timeoutId = setTimeout(() => {
        if (editTitle.trim() || editContent.trim()) {
          updateNote(selectedNote.id, {
            title: editTitle.trim() || '제목 없음',
            content: editContent,
            tags: editTags.split(',').map(tag => tag.trim()).filter(Boolean)
          });
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [editTitle, editContent, editTags, selectedNote, isEditing, updateNote]);

  const handleCreateNote = () => {
    const newNote = {
      title: '새 메모',
      content: '',
      tags: [],
      isPinned: false
    };
    
    addNote(newNote);
    
    // Select the new note (it will be the first in the list due to creation time)
    setTimeout(() => {
      const createdNote = notes.find(note => note.title === '새 메모' && note.content === '');
      if (createdNote) {
        setSelectedNote(createdNote);
        setIsEditing(true);
        setEditTitle(createdNote.title);
        setEditContent(createdNote.content);
        setEditTags(createdNote.tags.join(', '));
      }
    }, 100);
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(false);
    setIsPreview(false);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags.join(', '));
  };

  const handleTogglePin = (noteId: string, isPinned: boolean) => {
    updateNote(noteId, { isPinned: !isPinned });
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setIsPreview(false);
  };

  const handleSaveEdit = () => {
    if (selectedNote) {
      updateNote(selectedNote.id, {
        title: editTitle.trim() || '제목 없음',
        content: editContent,
        tags: editTags.split(',').map(tag => tag.trim()).filter(Boolean)
      });
      setIsEditing(false);
    }
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering (you can enhance this with a proper markdown library)
    let html = content
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-semibold mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/\n/g, '<br>');

    return { __html: html };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 h-full"
    >
      <div className="flex h-full space-x-6">
        {/* Notes List */}
        <div className="w-80 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">메모</h1>
            <Button onClick={handleCreateNote}>
              <Plus className="mr-2 h-4 w-4" />
              새 메모
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="메모 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">태그</p>
              <div className="flex flex-wrap gap-1">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag) 
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                  >
                    <Hash className="mr-1 h-2 w-2" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes List */}
          <div className="space-y-2 overflow-y-auto">
            <AnimatePresence>
              {filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${
                    selectedNote?.id === note.id ? 'bg-accent border-primary' : ''
                  }`}
                  onClick={() => handleSelectNote(note)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium truncate flex-1 pr-2">
                      {note.title}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {note.isPinned && (
                        <Pin className="h-3 w-3 text-yellow-500" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePin(note.id, note.isPinned);
                        }}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {note.content.replace(/[#*`]/g, '').substring(0, 100)}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{note.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(note.updatedAt), 'M/d', { locale: ko })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredNotes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>메모가 없습니다</p>
              </div>
            )}
          </div>
        </div>

        {/* Note Editor */}
        <div className="flex-1">
          {selectedNote ? (
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePin(selectedNote.id, selectedNote.isPinned)}
                  >
                    <Pin className={`h-4 w-4 ${selectedNote.isPinned ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {format(parseISO(selectedNote.updatedAt), 'PPpp', { locale: ko })}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!isEditing && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsPreview(!isPreview)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleStartEdit}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {isEditing && (
                    <Button size="sm" onClick={handleSaveEdit}>
                      저장
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNote(selectedNote.id)}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 space-y-4">
                {isEditing ? (
                  <>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="메모 제목"
                      className="text-lg font-semibold"
                    />
                    
                    <Input
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="태그 (쉼표로 구분)"
                      className="text-sm"
                    />
                    
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="메모 내용을 입력하세요..."
                      className="min-h-96 resize-none"
                    />
                  </>
                ) : (
                  <>
                    <div>
                      <h2 className="text-xl font-semibold mb-2">{selectedNote.title}</h2>
                      {selectedNote.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {selectedNote.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                              <Tag className="mr-1 h-2 w-2" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {isPreview ? (
                        <div 
                          dangerouslySetInnerHTML={renderMarkdown(selectedNote.content)}
                          className="min-h-96"
                        />
                      ) : (
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed min-h-96">
                          {selectedNote.content}
                        </pre>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <Edit3 className="mx-auto h-12 w-12 mb-4 opacity-20" />
                  <h3 className="text-lg font-medium mb-2">메모를 선택하세요</h3>
                  <p>메모를 선택하거나 새로운 메모를 만들어보세요.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}