/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';

import { UserWarning } from './UserWarning';

import {
  deleteTodo,
  getComplitedTodos,
  getTodos,
  patchTodoCompleted,
  patchTodoTitle,
  postTodo,
  USER_ID,
} from './api/todos';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Todos } from './components/Todos';

import { Todo } from './types/Todo';
import { TodoFilterStatus } from './types/TodoFilterStatus';
import { TypeError } from './types/TypeError';

import { TodoFilter } from './utils/filterTodos/TodoFilter';
import { ErrorNotification } from './components/ErrorNotification';

export const App: React.FC = () => {
  const refQuery = useRef<HTMLInputElement>(null);
  const refEditQuery = useRef<HTMLInputElement>(null);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [creatingTodo, setCreatingTodo] = useState<Todo | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [processingTodos, setProcessingTodos] = useState<number[]>([]);
  const [error, setError] = useState<TypeError>(TypeError.None);
  const [todoFilterState, setTodoFilterState] = useState<TodoFilterStatus>(
    TodoFilterStatus.All,
  );

  const filtredTodo = TodoFilter.Filter(
    todos,
    TodoFilter.FilterByComplit(todoFilterState),
  );

  //#region supportFunctions
  function getComplitedTodo() {
    return todos.reduce((prev, todo) => (todo.completed ? prev + 1 : prev), 0);
  }

  function closeErrorMesseg() {
    setTimeout(() => setError(TypeError.None), 3000);
  }

  //#endregion

  //#region TodosHandels

  const handelOnCompletedMarkClik = (id: number, completed: boolean) => {
    setProcessingTodos(previds => [...previds, id]);
    patchTodoCompleted(id, !completed)
      .then(() => {
        setTodos(prevTodos =>
          prevTodos.map(todo => {
            if (todo.id === id) {
              return { ...todo, completed: !todo.completed };
            }

            return { ...todo };
          }),
        );
      })
      .catch(() => setError(TypeError.UnableUpdateTodo))
      .finally(() => {
        setProcessingTodos(prevIds => prevIds.filter(previd => previd !== id));
        closeErrorMesseg();
      });
  };

  const handelOnDeleteClik = (id: number, onSuccess?: () => void) => {
    setProcessingTodos(prevdeletingTodos => [...prevdeletingTodos, id]);

    deleteTodo(id)
      .then(() => {
        setTodos(prevtodos => prevtodos.filter(todo => todo.id !== id));
        onSuccess?.();
      })
      .catch(() => {
        setError(TypeError.UnableDeleteTodo);
      })
      .finally(() => {
        closeErrorMesseg();

        setProcessingTodos(prevdeletingTodos =>
          prevdeletingTodos.filter(deletingId => deletingId !== id),
        );
      });
  };

  const handelOnEditClik = (id: number) =>
    setEditingTodo(todos.find(todo => todo.id === id) || null);

  const handelAnimations = (id: number) => !!processingTodos.includes(id);
  const handelEditing = (id: number) => editingTodo?.id !== id;

  const handelEditCensel = () => setEditingTodo(null);

  const handelEditSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    let newTitle = '';

    if (refEditQuery.current) {
      newTitle = refEditQuery.current.value.trim();
    }

    if (!editingTodo) {
      return;
    }

    if (newTitle === editingTodo.title) {
      handelEditCensel();

      return;
    }

    if (newTitle === '') {
      handelOnDeleteClik(editingTodo.id, handelEditCensel);

      return;
    }

    setProcessingTodos(prevTodos => [...prevTodos, editingTodo.id]);

    patchTodoTitle(editingTodo.id, newTitle)
      .then(() => {
        setTodos(prevTodos =>
          prevTodos.map(todo => {
            if (todo.id === editingTodo.id) {
              return { ...todo, title: newTitle };
            }

            return { ...todo };
          }),
        );
        setEditingTodo(null);
      })
      .catch(() => {
        setError(TypeError.UnableUpdateTodo);
        refEditQuery.current?.focus();
      })
      .finally(() => {
        closeErrorMesseg();
        setProcessingTodos(prevTodos =>
          prevTodos.filter(todo => {
            if (!editingTodo) {
              return true;
            }

            return todo !== editingTodo.id;
          }),
        );
      });
  };

  //#endregion

  // #region HeaderHandels

  const handelOnSummit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newTitle = refQuery.current?.value.trim() || '';

    if (newTitle.length > 0) {
      const newTodo = { userId: USER_ID, title: newTitle, completed: false };

      postTodo(newTodo)
        .then(createdtodo => {
          setTodos([...todos, createdtodo]);
          if (refQuery.current) {
            refQuery.current.value = '';
          }
        })
        .catch(() => {
          setError(TypeError.UnableAddTodo);
        })
        .finally(() => {
          setCreatingTodo(null);
          closeErrorMesseg();
        });

      setCreatingTodo({ ...newTodo, id: 0 });
    } else {
      setError(TypeError.TitleEmpty);
      closeErrorMesseg();
    }
  };

  const handelOnToggleAllTodo = () => {
    const activeTodos = todos.filter(todo => !todo.completed);

    if (activeTodos.length > 0) {
      activeTodos.forEach(todo =>
        handelOnCompletedMarkClik(todo.id, todo.completed),
      );
    } else {
      todos.forEach(todo => handelOnCompletedMarkClik(todo.id, todo.completed));
    }
  };

  //#endregion

  // #region FooterHandels

  const handelSetTodoFilter = (FilterStatus: TodoFilterStatus) => {
    setTodoFilterState(FilterStatus);
  };

  const handelDeleteCompletedTodos = () => {
    getComplitedTodos(USER_ID)
      .then(complitedTodos => {
        complitedTodos.forEach(({ id }) => {
          handelOnDeleteClik(id);
        });
      })
      .catch(() => setError(TypeError.UnableDeleteTodo))
      .finally(closeErrorMesseg);
  };

  // #endregion

  //#region useEffect

  useEffect(() => {
    getTodos(USER_ID)
      .then(newTodos => {
        setTodos(newTodos);
      })
      .catch(() => {
        setError(TypeError.UnableLoadTodos);
      })
      .finally(closeErrorMesseg);
  }, []);

  useEffect(() => {
    refQuery.current?.focus();
  }, [creatingTodo, todos]);

  useEffect(() => {
    if (refEditQuery.current) {
      refEditQuery.current.value = editingTodo?.title || '';
      refEditQuery.current.focus();
    }
  }, [editingTodo]);

  // #endregion

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          refQuery={refQuery}
          isAllTodoDone={todos.length === getComplitedTodo()}
          isCreatingTodo={!!creatingTodo}
          isExistTodo={!!todos.length}
          onSubmitTodo={handelOnSummit}
          onToggleAllTodo={handelOnToggleAllTodo}
        />

        <Todos
          todos={filtredTodo}
          creatingTodo={creatingTodo}
          refEditing={refEditQuery}
          isEditingTodo={handelEditing}
          isProcessing={handelAnimations}
          onCompletedMarkClik={handelOnCompletedMarkClik}
          onDeleteClik={handelOnDeleteClik}
          onEditClik={handelOnEditClik}
          onEditSubmit={handelEditSubmit}
          onEditCensel={handelEditCensel}
        />

        <Footer
          totalTodos={todos.length}
          complitedTodos={getComplitedTodo()}
          selectedFilter={todoFilterState}
          setTodoFilter={handelSetTodoFilter}
          deleteCompletedTodos={handelDeleteCompletedTodos}
        />
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <ErrorNotification errorType={error} />
    </div>
  );
};
