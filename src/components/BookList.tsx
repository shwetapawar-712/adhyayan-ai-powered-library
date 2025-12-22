import { Book, BookStatus } from '@/types/library';
import { Book as BookIcon, CheckCircle, Clock, UserCheck, Search } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface BookListProps {
  books: Book[];
  stats: { total: number; available: number; borrowed: number; reserved: number };
}

const BookList = ({ books, stats }: BookListProps) => {
  const [search, setSearch] = useState('');

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase())
  );

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
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <BookIcon className="w-5 h-5 text-primary" />
              Library Books
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.available} of {stats.total} available
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredBooks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {search ? 'No books found matching your search' : 'No books available'}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{book.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{book.author}</p>
                </div>
                {getStatusBadge(book.status)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookList;
