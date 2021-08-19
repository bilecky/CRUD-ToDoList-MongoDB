const mongo = require("mongodb");

const client = new mongo.MongoClient("mongodb://localhost:27017", {
  useNewUrlParser: true,
});

function addNewToDo(todosCollection, title) {
  todosCollection.insertOne(
    {
      title,
      done: false,
    },
    (err) => {
      if (err) {
        console.log("blad podczas dodawania", err);
      } else {
        console.log("zadanie dodane");
      }

      client.close();
    }
  );
}

function deleteAllDoneTask(todosCollection) {
  todosCollection.deleteMany(
    {
      done: true,
    },
    (err) => {
      if (err) {
        console.log("blad podczas usuwania", err);
      } else {
        console.log("Wyczyszczono zakonczone zadanie jesli byly");
      }
      client.close();
    }
  );
}

function deleteTask(todosCollection, id) {
  todosCollection
    .find({
      _id: mongo.ObjectID(id),
    })
    .toArray((err, todos) => {
      if (err) {
        console.log("blad podczas pobierania", err);
      } else if (todos.length !== 1) {
        console.log("nie ma takiego zadania");
      } else {
        todosCollection.deleteOne(
          {
            _id: mongo.ObjectID(id),
          },
          (err) => {
            if (err) {
              console.log("blad podczas usuwania", err);
            } else {
              console.log("zadanie usuniete");
            }
            client.close();
          }
        );
      }
    });
}

function showAllTodos(todosCollection) {
  todosCollection.find({}).toArray((err, todos) => {
    if (err) {
      console.log("blad podczas pobierania", err);
    } else {
      const todosToDo = todos.filter((todo) => !todo.done);
      const todosDone = todos.filter((todo) => todo.done);

      console.log(
        `# Lista zadan do zrobienia (niezakonczone) : ${todosToDo.length}`
      );

      for (const todo of todosToDo) {
        console.log(`- [${todo._id}] ${todo.title}`);
      }
      console.log(
        `# Lista zadan zrobionych (zakonczone) : ${todosDone.length}`
      );
      for (const todo of todosDone) {
        console.log(`- ${todo.title}`);
      }
    }
    client.close();
  });
}

function markTaskAsDone(todosCollection, id) {
  todosCollection
    .find({
      _id: mongo.ObjectID(id),
    })
    .toArray((err, todos) => {
      if (err) {
        console.log("blad podczas pobierania", err);
      } else if (todos.length !== 1) {
        console.log("nie ma takiego zadania");
      } else {
        todosCollection.updateOne(
          {
            _id: mongo.ObjectID(id),
          },
          {
            $set: { done: true },
          },
          (err) => {
            if (err) {
              console.log("blad podczas ustawiania zakonczenia", err);
            } else {
              console.log("zadanie oznaczone jako zakonczone");
            }
            client.close();
          }
        );
      }
    });
}

//   todosCollection.updateOne(
//     {
//       _id: mongo.ObjectID(id),
//     },
//     {
//       $set: { done: true },
//     },
//     (err) => {
//       if (err) {
//         console.log("blad podczas ustawiania zakonczenia", err);
//       } else {
//         console.log("zadanie oznaczone jako zakonczone");
//       }
//       client.close();
//     }
//   );
// }

function doTheToDo(todosCollection) {
  const [command, ...args] = process.argv.splice(2);

  switch (command) {
    case "add":
      addNewToDo(todosCollection, args[0]);
      break;
    case "list":
      showAllTodos(todosCollection);

      break;
    case "done":
      markTaskAsDone(todosCollection, args[0]);
      break;
    case "delete":
      deleteTask(todosCollection, args[0]);
      break;
    case "cleanup":
      deleteAllDoneTask(todosCollection);
      break;
  }
}

client.connect((err) => {
  if (err) {
    console.log("blad polaczenia", err);
  } else {
    console.log("polaczenie udane");

    const db = client.db("test");

    const todosCollection = db.collection("todos"); // do this INSIDE async function

    doTheToDo(todosCollection);
    // client.close();
  }
});
