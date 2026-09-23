import { Todo } from '../../types/Todo';
import { TodoRow } from '../TodoRow';
import { TodoLoadindRow } from '../TodoLoadindRow';

type Props = {
  todos: Todo[];
  todoToCreate: Todo | null;
  onsaveTodo: (id: number, changes: Partial<Omit<Todo, 'id'>>) => Promise<void>;
  onDeleteTodo: (id: number) => Promise<void>;
};

export const TodosList: React.FC<Props> = ({
  todos,
  todoToCreate,
  onsaveTodo,
  onDeleteTodo,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => {
        return (
          <TodoRow
            key={todo.id}
            todo={todo}
            saveTodo={onsaveTodo}
            onDeleteTodo={onDeleteTodo}
          />
        );
      })}

      {/* This todo is in loadind state */}
      {todoToCreate && <TodoLoadindRow title={todoToCreate.title} />}
    </section>
  );
};
