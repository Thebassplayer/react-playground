import "./styles.css";
import { useEffect, useState } from "react";

type Book = {
  id: string;
  title: string;
  author: string;
};

type Database = Book[];

type Response<T> = {
  success: boolean;
  data: T;
};

const randomNum = Math.floor(Math.random() * 10);
console.log(randomNum);

function fakeRequest(): Promise<Response<Database>> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (randomNum >= 5) {
        reject(new Error("Failed to load Books"));
        return;
      }

      resolve({
        success: true,
        data: [
          {
            id: "dbcc5fee-5a29-445f-ac88-c946578bedfa",
            title: "El señor de los anillos",
            author: "Tolkien",
          },
        ],
      });
    }, 2000);
  });
}

const removeDuplicates = (books: Book[]) => {
  const uniqueIds = new Set<Book["id"]>();

  return books.filter(book => {
    if (uniqueIds.has(book.id)) {
      return false;
    }

    uniqueIds.add(book.id);
    return true;
  });
};

export default function App() {
  const [dataState, setDataState] = useState<string>("No data");

  const [books, setBook] = useState<Database>([]);

  const [form, setForm] = useState<Book>({
    id: "",
    title: "",
    author: "",
  });

  useEffect(() => {
    let alredyRequested = false;

    async function loadData() {
      const response = fakeRequest();

      setDataState("Loading");

      if (!alredyRequested) {
        try {
          const { success, data: newBooks } = await response;
          console.log(success);

          if (!success) {
            setDataState("Error");
          }
          setDataState("");

          handleSetBooks(newBooks);
        } catch (error) {
          console.error(error);
          setDataState("Error");
        }
      }
    }
    loadData();
    return () => {
      alredyRequested = true;
    };
  }, []);

  function handleSetBooks(newBooks: Book[]) {
    setBook(currentBooks => removeDuplicates([...currentBooks, ...newBooks]));
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm(currentBooks => ({
      ...currentBooks,
      [name]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const book = {
      id: crypto.randomUUID(),
      title: formData.get("title") as string,
      author: formData.get("author") as string,
    };

    console.log("SUBMITTED");
    console.log(book);

    handleSetBooks([book]);
    setForm({ id: "", title: "", author: "" });
  }

  function handleDelete(event: React.MouseEvent<HTMLButtonElement>) {
    const id = event.currentTarget.id;
    setBook(currentBooks => currentBooks.filter(book => book.id != id));
  }

  return (
    <div className="App">
      <h1>React Playground!</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
        />
        <input
          type="text"
          name="author"
          placeholder="Author"
          value={form.author}
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </form>
      {dataState ? (
        <span>{dataState}</span>
      ) : (
        <div>
          {books.map(book => (
            <div key={book.id} style={{ paddingTop: "1rem" }}>
              <span>{book.title}</span>
              <span>{" | "}</span>
              <span>{book.author}</span>
              <span>{" | "}</span>
              <span>{book.id}</span>
              <button
                style={{ marginLeft: "10px", backgroundColor: "red" }}
                id={book.id}
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
