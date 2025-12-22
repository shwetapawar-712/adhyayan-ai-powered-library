import { useState, useEffect, useCallback } from 'react';
import { Book } from '@/types/library';

const BOOKS_STORAGE_KEY = 'smart-library-books';

const initialBooks: Book[] = [
  {
    id: 'book-1',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    status: 'available',
    addedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'book-2',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    status: 'borrowed',
    addedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'book-3',
    title: 'Design Patterns',
    author: 'Gang of Four',
    status: 'available',
    addedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'book-4',
    title: 'The Pragmatic Programmer',
    author: 'David Thomas',
    status: 'reserved',
    addedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Load books safely
  useEffect(() => {
    const stored = localStorage.getItem(BOOKS_STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);

      // ✅ Recover from empty or corrupted storage
      if (Array.isArray(parsed) && parsed.length > 0) {
        setBooks(parsed);
      } else {
        setBooks(initialBooks);
        localStorage.setItem(
          BOOKS_STORAGE_KEY,
          JSON.stringify(initialBooks)
        );
      }
    } else {
      setBooks(initialBooks);
      localStorage.setItem(
        BOOKS_STORAGE_KEY,
        JSON.stringify(initialBooks)
      );
    }

    setIsLoading(false);
  }, []);

  // ✅ Persist changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(
        BOOKS_STORAGE_KEY,
        JSON.stringify(books)
      );
    }
  }, [books, isLoading]);

  const addBook = useCallback((title: string, author: string) => {
    const newBook: Book = {
      id: `book-${Date.now()}`,
      title: title.trim(),
      author: author.trim(),
      status: 'available',
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBooks((prev) => [...prev, newBook]);
    return newBook;
  }, []);

  const updateBook = useCallback(
    (id: string, updates: Partial<Book>) => {
      setBooks((prev) =>
        prev.map((book) =>
          book.id === id
            ? { ...book, ...updates, updatedAt: new Date().toISOString() }
            : book
        )
      );
    },
    []
  );

  const deleteBook = useCallback((id: string) => {
    setBooks((prev) => prev.filter((book) => book.id !== id));
  }, []);

  const getBookById = useCallback(
    (id: string) => books.find((book) => book.id === id),
    [books]
  );

  const getBookStats = useCallback(() => {
    return {
      total: books.length,
      available: books.filter((b) => b.status === 'available').length,
      borrowed: books.filter((b) => b.status === 'borrowed').length,
      reserved: books.filter((b) => b.status === 'reserved').length,
    };
  }, [books]);

  return {
    books,
    isLoading,
    addBook,
    updateBook,
    deleteBook,
    getBookById,
    getBookStats,
  };
};
