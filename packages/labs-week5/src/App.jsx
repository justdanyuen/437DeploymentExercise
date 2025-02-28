import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { useRef } from 'react';
import { GroceryPanel } from './GroceryPanel';


function AddTaskForm({ onAddTask }) {
    const [newTask, setNewTask] = useState('');
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (newTask.trim() === '') return;
      onAddTask(newTask);
      setNewTask('');  // Clear input
    };
  
    return (
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          className="border rounded px-2 py-1 mr-2"
          placeholder="New task name"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 active:bg-blue-900 text-white px-3 py-1 rounded"
          title = "Add task"
        >
          Add task
        </button>
      </form>
    );
  }

function TodoItem({ id, name, completed, onToggleComplete, onDelete }) {
  return (
    <li className="flex items-center mb-2">
      <input
        id={id}
        type="checkbox"
        checked={completed}
        onChange={() => onToggleComplete(id)}
        className="mr-2"
      />
      <label htmlFor={id} className={`mr-2 ${completed ? 'line-through text-gray-500' : ''}`}>
        {name}
      </label>
      <button
        className="ml-2 text-gray-500 hover:text-gray-700"
        onClick={() => onDelete(id)}
      >
        <FontAwesomeIcon icon={faTrashCan} title="Delete task" />
      </button>
    </li>
  );
}

function Modal({ children, headerLabel, isOpen, onCloseRequested }) {
    const modalRef = useRef(null);

    if (!isOpen) return null; // Only render the modal if it is open
  
    const handleOverlayClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onCloseRequested();
          }
    }

    return (
        <div 
            className="fixed inset-0 bg-white/50 flex items-center justify-center"
            onClick={handleOverlayClick} 
            >
            <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">{headerLabel}</h2>
                <button
                onClick={onCloseRequested}
                aria-label="Close"
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >x </button>
                </div>
                {children}
            </div>
        </div>
    );
  }



function App() {
  const [tasks, setTasks] = useState([
    {id: "todo-0", name: "Eat", completed: false},
    {id: "todo-1", name: "Sleep", completed: false},
    {id: "todo-2", name: "Repeat", completed: false}
  ]);  // State to store tasks

  const [isModalOpen, setModalOpen] = useState(false);  // State to control modal visibility


  const handleAddTask = (taskName) => {
    const newTask = {
        id: `todo-${tasks.length}`,
        name: taskName,
        completed: false
      };
      setTasks([...tasks, newTask]);
      setModalOpen(false);
  };

  const handleToggleComplete = (id) => {
    setTasks(tasks.map(task => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <main className="m-4">
        {/* <AddTaskForm onAddTask={handleAddTask} /> */}
      <section>
        {/* <h1 className="text-xl font-bold">To do</h1> */}
        <button onClick={() => setModalOpen(true)} className="p-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded mb-4">
            New Task
        </button>
        <Modal
          headerLabel="New Task"
          isOpen={isModalOpen}
          onCloseRequested={() => setModalOpen(false)}
        >
          <AddTaskForm onAddTask={handleAddTask} />
        </Modal>

        {/* <button onClick={() => setTasks([])} className="p-1 bg-red-600 text-white" title="Delete all tasks">Delete all</button> */}
        <ul>
          {tasks.map(task => (
            <TodoItem
            key={task.id}
            id={task.id}
            name={task.name}
            completed={task.completed}           
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteTask}
          />
          ))}
        </ul>

        <GroceryPanel onAddTodo={handleAddTask}/>

      </section>
    </main>
  );
}

export default App;
