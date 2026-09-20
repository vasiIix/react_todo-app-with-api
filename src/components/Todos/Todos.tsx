import React from 'react';
import cn from 'classnames';
import { Todo } from '../../types/Todo';

type Props = {
  todos: Todo[];
  creatingTodo: Todo | null;
  refEditing: React.Ref<HTMLInputElement>;
  isEditingTodo: (id: number) => boolean;
  isProcessing: (id: number) => boolean;
  onCompletedMarkClik: (id: number, completed: boolean) => void;
  onDeleteClik: (id: number) => void;
  onEditClik: (id: number) => void;
  onEditSubmit: (event?: React.FormEvent<HTMLFormElement>) => void;
  onEditCensel: () => void;
};

export const Todos: React.FC<Props> = ({
  todos,
  creatingTodo,
  refEditing,
  isEditingTodo,
  isProcessing,
  onCompletedMarkClik,
  onDeleteClik,
  onEditClik,
  onEditSubmit,
  onEditCensel,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(({ id, completed, title }) => {
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
                onChange={() => onCompletedMarkClik(id, completed)}
              />{' '}
            </label>

            {isEditingTodo(id) ? (
              <>
                <span
                  data-cy="TodoTitle"
                  className="todo__title"
                  onDoubleClick={() => {
                    onEditClik(id);
                  }}
                >
                  {title}
                </span>
                <button
                  type="button"
                  className="todo__remove"
                  data-cy="TodoDelete"
                  onClick={() => onDeleteClik(id)}
                >
                  ×
                </button>
              </>
            ) : (
              <form onSubmit={onEditSubmit}>
                <input
                  data-cy="TodoTitleField"
                  type="text"
                  className="todo__title-field"
                  placeholder="Empty todo will be deleted"
                  ref={refEditing}
                  onBlur={() => onEditSubmit()}
                  onKeyUp={event => {
                    if (event.key === 'Escape') {
                      onEditCensel();
                    }
                  }}
                />
              </form>
            )}

            {/* overlay will cover the todo while it is being deleted or updated */}
            <div
              data-cy="TodoLoader"
              className={cn('modal', 'overlay', {
                'is-active': isProcessing(id),
              })}
            >
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          </div>
        );
      })}

      {/* This todo is in loadind state */}
      {creatingTodo && (
        <div data-cy="Todo" className="todo">
          <label className="todo__status-label">
            <input
              data-cy="TodoStatus"
              type="checkbox"
              className="todo__status"
            />{' '}
          </label>
          <span data-cy="TodoTitle" className="todo__title">
            {creatingTodo.title}
          </span>
          <button type="button" className="todo__remove" data-cy="TodoDelete">
            ×
          </button>
          {/* * 'is-active' class puts this modal on top of the todo * */}
          <div data-cy="TodoLoader" className="modal overlay is-active">
            <div className="modal-background has-background-white-ter" />
            <div className="loader" />
          </div>
        </div>
      )}
    </section>
  );
};
