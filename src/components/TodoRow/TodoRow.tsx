import React, { useEffect, useRef, useState } from 'react';
import { Todo } from '../../types/Todo';
import cn from 'classnames';

type Props = {
  todo: Todo;
  saveTodo: (id: number, changes: Partial<Omit<Todo, 'id'>>) => Promise<void>;
  onDeleteTodo: (id: number) => Promise<void>;
};

export const TodoRow: React.FC<Props> = ({ todo, saveTodo, onDeleteTodo }) => {
  const { id, title, completed } = todo;

  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const refEditQuery = useRef<HTMLInputElement>(null);

  const editTodo = async (
    changes: Partial<Omit<Todo, 'id'>>,
    onSuccess?: () => void,
  ) => {
    setIsAnimating(true);
    try {
      await saveTodo(id, changes);
      onSuccess?.();
    } catch (error) {
    } finally {
      setIsAnimating(false);
    }
  };

  const deleteTodo = async () => {
    setIsAnimating(true);
    try {
      await onDeleteTodo(id);
    } catch (error) {
    } finally {
      setIsAnimating(false);
    }
  };

  const handleEditClick = () => setIsEdit(true);

  const handleEditSubmit = () => {
    let newTitle = '';

    if (refEditQuery.current) {
      newTitle = refEditQuery.current.value.trim();
    }

    if (newTitle === title) {
      setIsEdit(false);

      return;
    }

    if (newTitle === '') {
      deleteTodo();

      return;
    }

    editTodo({ title: newTitle }, () => setIsEdit(false));
  };

  const handleToggleComplete = () => editTodo({ completed: !completed });

  const handleEditCancel = () => setIsEdit(false);

  const handleDeleteClick = () => deleteTodo();

  useEffect(() => {
    if (refEditQuery.current) {
      refEditQuery.current.value = title;
      refEditQuery.current.focus();
    }
  }, [isEdit]);

  return (
    <div
      data-cy="Todo"
      className={cn('todo', { completed: completed })}
      key={id}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={completed}
          onChange={handleToggleComplete}
        />{' '}
      </label>

      {isEdit ? (
        <form
          onSubmit={e => {
            e.preventDefault();
            handleEditSubmit();
          }}
        >
          <input
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            ref={refEditQuery}
            onBlur={() => handleEditSubmit()}
            onKeyUp={event => {
              if (event.key === 'Escape') {
                handleEditCancel();
              }
            }}
          />
        </form>
      ) : (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={handleEditClick}
          >
            {title}
          </span>
          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => handleDeleteClick()}
          >
            ×
          </button>
        </>
      )}

      {/* overlay will cover the todo while it is being deleted or updated */}
      <div
        data-cy="TodoLoader"
        className={cn('modal', 'overlay', {
          'is-active': isAnimating,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
