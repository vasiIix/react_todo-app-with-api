/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';

import * as todoAPI from './api/todos';

import { TodoForm } from './components/TodoForm';
import { Footer } from './components/Footer';
import { TodosList } from './components/TodosList';

import { Todo } from './types/Todo';
import { TodoFilterStatus } from './types/TodoFilterStatus';
import { TypeError } from './types/TypeError';

import { TodoFilter } from './utils/filterTodos/TodoFilter';
import { ErrorNotification } from './components/ErrorNotification';
import { ToggleAll } from './components/ToggleAll';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoToCreate, setTodoToCreate] = useState<Todo | null>(null);
  const [error, setError] = useState<TypeError>(TypeError.None);
  const [todoFilterState, setTodoFilterState] = useState<TodoFilterStatus>(
    TodoFilterStatus.All,
  );
  const refQuery = useRef<HTMLInputElement>(null);

  const filteredTodos = TodoFilter.Filter(
    todos,
    TodoFilter.FilterByComplete(todoFilterState),
  );

  //#region supportFunctions
  function getCompletedTodosCount() {
    return todos.reduce((prev, todo) => (todo.completed ? prev + 1 : prev), 0);
  }

  function closeErrorMessage() {
    setTimeout(() => setError(TypeError.None), 3000);
  }

  //#endregion
  const saveTodo = (title: string) => {
    if (title.length > 0) {
      const newTodo = {
        title: title,
        completed: false,
      };

      setTodoToCreate({ ...newTodo, userId: -1, id: -1 });

      return todoAPI
        .postTodo(newTodo)
        .then(createdTodo => {
          setTodos([...todos, createdTodo]);
        })
        .catch(requestError => {
          setError(TypeError.UnableAddTodo);
          throw requestError;
        })
        .finally(() => {
          setTodoToCreate(null);
          closeErrorMessage();
        });
    } else {
      setError(TypeError.TitleEmpty);
      closeErrorMessage();

      return Promise.resolve();
    }
  };

  const changeTodo = (id: number, changes: Partial<Omit<Todo, 'id'>>) => {
    return todoAPI
      .patchTodo(id, changes)
      .then(() => {
        setTodos(prevTodos =>
          prevTodos.map(todo => {
            if (todo.id === id) {
              return { ...todo, ...changes };
            }

            return { ...todo };
          }),
        );
      })
      .catch(requestError => {
        setError(TypeError.UnableUpdateTodo);
        throw requestError;
      })
      .finally(() => {
        closeErrorMessage();
      });
  };

  const deleteTodo = (id: number, onSuccess?: () => void) => {
    return todoAPI
      .deleteTodo(id)
      .then(() => {
        setTodos(previousTodos => previousTodos.filter(todo => todo.id !== id));
        onSuccess?.();
        if (refQuery.current) {
          refQuery.current.value = '';
        }
      })
      .catch(() => {
        setError(TypeError.UnableDeleteTodo);
      })
      .finally(() => {
        closeErrorMessage();
        refQuery.current?.focus();
      });
  };

  const handleToggleAllTodos = () => {
    const activeTodos = todos.filter(todo => !todo.completed);

    if (activeTodos.length > 0) {
      activeTodos.forEach(todo =>
        changeTodo(todo.id, { completed: !todo.completed }),
      );
    } else {
      todos.forEach(todo =>
        changeTodo(todo.id, { completed: !todo.completed }),
      );
    }
  };

  // #region FooterHandels

  const handleSetTodoFilter = (filterStatus: TodoFilterStatus) => {
    setTodoFilterState(filterStatus);
  };

  const handleDeleteCompletedTodos = () => {
    todoAPI
      .getCompletedTodos()
      .then(completedTodos => {
        completedTodos.forEach(({ id }) => {
          deleteTodo(id);
        });
      })
      .catch(() => setError(TypeError.UnableDeleteTodo))
      .finally(closeErrorMessage);
  };

  // #endregion

  //#region useEffect

  useEffect(() => {
    todoAPI
      .getTodos()
      .then(newTodos => {
        setTodos(newTodos);
      })
      .catch(() => {
        setError(TypeError.UnableLoadTodos);
      })
      .finally(closeErrorMessage);
  }, []);

  // #endregion

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          <ToggleAll
            isAllDone={todos.length === getCompletedTodosCount()}
            isExist={!!todos.length}
            onToggle={handleToggleAllTodos}
          />
          <TodoForm onSaveTodo={saveTodo} refQuery={refQuery} />
        </header>

        <TodosList
          todos={filteredTodos}
          todoToCreate={todoToCreate}
          onsaveTodo={changeTodo}
          onDeleteTodo={deleteTodo}
        />

        <Footer
          totalTodos={todos.length}
          completedTodos={getCompletedTodosCount()}
          selectedFilter={todoFilterState}
          setTodoFilter={handleSetTodoFilter}
          deleteCompletedTodos={handleDeleteCompletedTodos}
        />
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <ErrorNotification errorType={error} />
    </div>
  );
};
