import { useState } from 'react';
import { Book, BookStatus } from '@/types/library';
import { Plus, Pencil, Trash2, Book as BookIcon, CheckCircle, Clock, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';

interface BookManagementProps {
  books: Book[];
  onAddBook: (title: string, author: string) => void;
  onUpdateBook: (id: string, updates: Partial<Pick<Book, 'title' | 'author' | 'status'>>) => void;
  onDeleteBook: (id: string) => void;
  stats: { total: number; available: number; borrowed: number; reserved: number };
}

const BookManagement = ({ books, onAddBook, onUpdateBook, onDeleteBook, stats }: BookManagementProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({ title: '', author: '', status: 'available' as BookStatus });

  const handleAdd = () => {
    if (formData.title && formData.author) {
      onAddBook(formData.title, formData.author);
      setFormData({ title: '', author: '', status: 'available' });
      setIsAddDialogOpen(false);
    }
  };

  const handleEdit = () => {
    if (editingBook && formData.title && formData.author) {
      onUpdateBook(editingBook.id, {
        title: formData.title,
        author: formData.author,
        status: formData.status,
      });
      setEditingBook(null);
      setFormData({ title: '', author: '', status: 'available' });
    }
  };

  const openEditDialog = (book: Book) => {
    setEditingBook(book);
    setFormData({ title: book.title, author: book.author, status: book.status });
  };

  const getStatusBadge = (status: BookStatus) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1" />Available</Badge>;
      case 'borrowed':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="w-3 h-3 mr-1" />Borrowed</Badge>;
      case 'reserved':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><UserCheck className="w-3 h-3 mr-1" />Reserved</Badge>;
    }
  };

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <BookIcon className="w-5 h-5 text-primary" />
            Book Management
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.total} total • {stats.available} available • {stats.borrowed} borrowed • {stats.reserved} reserved
          </p>
        </div>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Book
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No books added yet
                  </TableCell>
                </TableRow>
              ) : (
                books.map((book) => (
                  <TableRow key={book.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell className="text-muted-foreground">{book.author}</TableCell>
                    <TableCell>{getStatusBadge(book.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(book)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDeleteBook(book.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="glass-card border-border/50">
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter book title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                placeholder="Enter author name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!formData.title || !formData.author}>Add Book</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingBook} onOpenChange={(open) => !open && setEditingBook(null)}>
        <DialogContent className="glass-card border-border/50">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-author">Author</Label>
              <Input
                id="edit-author"
                value={formData.author}
                onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: BookStatus) => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="borrowed">Borrowed</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBook(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={!formData.title || !formData.author}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default BookManagement;
