import React, { useEffect, useState } from 'react';

type Props = {
  refQuery: React.RefObject<HTMLInputElement>;
  onSaveTodo: (title: string) => Promise<void>;
};

export const TodoForm: React.FC<Props> = ({ onSaveTodo, refQuery }) => {
  const [isActiv, setIsActiv] = useState<boolean>(true);

  useEffect(() => {
    refQuery.current?.focus();
  }, [isActiv, refQuery]);

  const save = async (tite: string) => {
    try {
      setIsActiv(false);
      await onSaveTodo(tite);
      refQuery.current?.form?.reset();
    } catch (error) {
    } finally {
      setIsActiv(true);
    }
  };

  const handleSubmit = () => {
    const newTitle = refQuery.current?.value.trim() || '';

    save(newTitle);
  };

  return (
    <header className="todoapp__header">
      {/* Add a todo on form submit */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          disabled={!isActiv}
          ref={refQuery}
        />
      </form>
    </header>
  );
};
