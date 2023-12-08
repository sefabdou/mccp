const listsContainer = document.querySelector('[data-lists]')
const newListForm = document.querySelector('[data-new-list-form]')
const newListInput = document.querySelector('[data-new-list-input]')
const deleteListButton = document.querySelector('[data-delete-list-button]')
const listDisplayContainer = document.querySelector('[data-list-display-container]')
const listTitleElement = document.querySelector('[data-list-title]')
const listCountElement = document.querySelector('[data-list-count]')
const tasksContainer = document.querySelector('[data-tasks]')
const taskTemplate = document.getElementById('task-template')
const newTaskForm = document.querySelector('[data-new-task-form]')
//inputs for taks
const newTaskInput = document.querySelector('[data-new-task-input]')
const newTaskInput2 = document.querySelector('[data-new-task-input-timeES]')
const taskImportance = document.querySelector('[data-new-task-importance]')
const taskDate = document.querySelector('[data-new-task-date]')








const clearCompleteTasksButton = document.querySelector('[data-clear-complete-tasks-button]')

const LOCAL_STORAGE_LIST_KEY = 'task.lists'
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId'
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || []
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY)

listsContainer.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'li') {
    selectedListId = e.target.dataset.listId
    saveAndRender()
  }
})

tasksContainer.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'input') {
    const selectedList = lists.find(list => list.id === selectedListId)
    const selectedTask = selectedList.tasks.find(task => task.id === e.target.id)
    selectedTask.complete = e.target.checked
    save()
    renderTaskCount(selectedList)
  }
})

clearCompleteTasksButton.addEventListener('click', e => {
  const selectedList = lists.find(list => list.id === selectedListId)
  selectedList.tasks = selectedList.tasks.filter(task => !task.complete)
  saveAndRender()
})

deleteListButton.addEventListener('click', e => {
  lists = lists.filter(list => list.id !== selectedListId)
  selectedListId = null
  saveAndRender()
})

newListForm.addEventListener('submit', e => {
  e.preventDefault()
  const listName = newListInput.value
  if (listName == null || listName === '') return
  const list = createList(listName)
  newListInput.value = null
  lists.push(list)
  saveAndRender()
})

newTaskForm.addEventListener('submit', e => {
  e.preventDefault()
  const taskName = newTaskInput.value
  const taskTimeES = newTaskInput2.value
  const taskImpo = taskImportance.value
  const taskDa = taskDate.value

  if (taskName == null || taskName === '') return
  const task = createTask(taskName,taskTimeES,taskImpo,taskDa)
  //clear the INPUTS
  newTaskInput.value = null
  newTaskInput2.value =null
  taskImportance.value=null
  taskDate.value=null
  //push data into the list of task
  const selectedList = lists.find(list => list.id === selectedListId)
  selectedList.tasks.push(task)
  
  saveAndRender()
})

function createList(name) {
  return { id: Date.now().toString(), name: name, tasks: [] }
}

function createTask(name,timeES,taskImpo,taskDa) {
  return { id: Date.now().toString(), name: name, timeES:timeES,taskImpo:taskImpo,taskDa:taskDa ,complete: false }
}

function saveAndRender() {
  save()
  render()
}

function save() {
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists))
  localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId)
}

function render() {
  clearElement(listsContainer)
  renderLists()

  const selectedList = lists.find(list => list.id === selectedListId)
  if (selectedListId == null) {
    listDisplayContainer.style.display = 'none'
  } else {
    listDisplayContainer.style.display = ''
    listTitleElement.innerText = selectedList.name
    renderTaskCount(selectedList)
    clearElement(tasksContainer)
    renderTasks(selectedList)
  }
}

function renderTasks(selectedList) {
  selectedList.tasks.forEach(task => {
    const taskElement = document.importNode(taskTemplate.content, true)
    const checkbox = taskElement.querySelector('input')
    checkbox.id = task.id
    checkbox.checked = task.complete
    const label = taskElement.querySelector('label')
    label.htmlFor = task.id
    label.append(task.name)
    tasksContainer.appendChild(taskElement)
  })
}

function renderTaskCount(selectedList) {
  const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length
  const taskString = incompleteTaskCount === 1 ? "task" : "tasks"
  listCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`
}

function renderLists() {
  lists.forEach(list => {
    const listElement = document.createElement('li')
    listElement.dataset.listId = list.id
    listElement.classList.add("list-name")
    listElement.innerText = list.name
    if (list.id === selectedListId) {
      listElement.classList.add('active-list')
    }
    listsContainer.appendChild(listElement)
  })
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}


//DYNAMIC PROGRAMMING 




function scheduleTasks(tasks) {
  const importanceOrder = {
    'Important': 3,
    'medium': 2,
    'not-important': 1,
  };
  const sortedTasks = tasks.sort((a, b) => {
    const dateA = new Date(a.taskDa).getTime();
    const dateB = new Date(b.taskDa).getTime();
     
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    const importanceA = importanceOrder[a.taskImpo] || 0;
    const importanceB = importanceOrder[b.taskImpo] || 0;

    if (importanceA > importanceB) return -1;
    if (importanceA < importanceB) return 1;
    if (a.timeES < b.timeES) return -1;
    if (a.timeES > b.timeES) return 1;
    return 0;
  });

  const dp = Array(sortedTasks.length).fill(0);

  for (let i = 0; i < sortedTasks.length; i++) {
    const currentTask = sortedTasks[i];
    const optimalCompletionTime = i > 0 ? Math.max(dp[i - 1], new Date(currentTask.taskDa).getTime()) : new Date(currentTask.taskDa).getTime();
    const completionHours = Number(currentTask.timeES);
    dp[i] = optimalCompletionTime + completionHours;
  }

  const optimalOrder = [];
  for (let i = sortedTasks.length - 1; i >= 0; i--) {
    if (dp[i] > 0) {
      optimalOrder.unshift(sortedTasks[i].name);
    }
  }

  return optimalOrder;
}
const storedData = localStorage.getItem('task.lists');
const dataArray = storedData ? JSON.parse(storedData) : [];

for (let i = 0; i < dataArray.length; i++) {
  const firstListTasks = dataArray.length > 0 ? dataArray[i].tasks : [];
  const optimalOrder = scheduleTasks(firstListTasks);
console.log('Optimal Completion Order:', optimalOrder);
}



function displayResults(listIndex, optimalOrder) {
  // Create a new div element to display the results
  const resultDiv = document.createElement('div');
  resultDiv.innerHTML = `<p><strong>Optimal Completion Order for List ${listIndex + 1}:</strong> ${optimalOrder.join(', ')}</p>`;

  // Append the div to the "output" div in the HTML
  document.getElementById('output').appendChild(resultDiv);
}

// Iterate over dataArray and display results for each list
for (let i = 0; i < dataArray.length; i++) {
  const firstListTasks = dataArray[i].tasks;
  const optimalOrder = scheduleTasks(firstListTasks);

  // Call the function to display results
  displayResults(i, optimalOrder);
}





render()