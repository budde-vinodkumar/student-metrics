let students = JSON.parse(localStorage.getItem('students')) || [];
let selectedStudentIndex = null;
let chart;
let currentQuestions = [];

// ---------- Student management ----------
function addStudent() {
  const name = document.getElementById('studentName').value.trim();
  if (!name) { alert('⚠️ Please enter a student name!'); return; }
  students.push({ name, skills: [], assignmentHistory: [] });
  localStorage.setItem('students', JSON.stringify(students));
  document.getElementById('studentName').value = '';
  renderStudentList();
}

function renderStudentList() {
  const list = document.getElementById('studentList');
  list.innerHTML = '';
  students.forEach((student, index) => {
    const li = document.createElement('li');
    li.innerHTML = `${student.name} <button class="delete-btn" onclick="deleteStudent(${index});event.stopPropagation();">❌</button>`;
    li.onclick = () => selectStudent(index);
    list.appendChild(li);
  });
}

function selectStudent(index) {
  selectedStudentIndex = index;
  const student = students[index];
  document.getElementById('studentDashboard').style.display = 'block';
  document.getElementById('studentTitle').innerText = `Student: ${student.name}`;
  updateDashboard();
}

function deleteStudent(index = selectedStudentIndex) {
  if (index === null || index === undefined) return;
  if (!confirm('Are you sure you want to delete this student?')) return;
  students.splice(index, 1);
  localStorage.setItem('students', JSON.stringify(students));
  selectedStudentIndex = null;
  document.getElementById('studentDashboard').style.display = 'none';
  renderStudentList();
}

// ---------- Skills ----------
function addSkill() {
  if (selectedStudentIndex === null) { alert('⚠️ Select a student first!'); return; }
  const skillName = document.getElementById('skillName').value.trim();
  const skillLevel = parseInt(document.getElementById('skillLevel').value);
  if (!skillName || isNaN(skillLevel) || skillLevel < 0 || skillLevel > 100) {
    alert('⚠️ Please enter valid skill details!');
    return;
  }
  students[selectedStudentIndex].skills.push({ name: skillName, level: skillLevel });
  localStorage.setItem('students', JSON.stringify(students));
  document.getElementById('skillName').value = '';
  document.getElementById('skillLevel').value = '';
  updateDashboard();
}

function deleteSkill(skillIndex) {
  if (selectedStudentIndex === null) return;
  students[selectedStudentIndex].skills.splice(skillIndex, 1);
  localStorage.setItem('students', JSON.stringify(students));
  updateDashboard();
}

// ---------- Dashboard & Analysis ----------
function updateDashboard() {
  const student = students[selectedStudentIndex];
  const skillsList = document.getElementById('skillsList');
  skillsList.innerHTML = '';
  if (!student) return;
  student.skills.forEach((skill, index) => {
    const skillDiv = document.createElement('div');
    skillDiv.classList.add('skill');
    skillDiv.innerHTML = `
      <label>${skill.name} (${skill.level}%)</label>
      <button class="delete-btn" onclick="deleteSkill(${index})">❌</button>
      <div class="progress">
        <div class="bar" style="width: ${skill.level}%;">${skill.level}%</div>
      </div>
    `;
    skillsList.appendChild(skillDiv);
  });
  analyzeSkills(student);
  updateChart(student);
  renderAssignmentHistory(student);
}

function analyzeSkills(student) {
  const analysisDiv = document.getElementById('analysis');
  if (!student.skills || student.skills.length === 0) {
    analysisDiv.innerHTML = '<p>❌ No skills added yet. Add some skills to see analysis and recommendations.</p>';
    return;
  }
  let maxSkill = student.skills.reduce((a,b) => a.level > b.level ? a : b);
  let minSkill = student.skills.reduce((a,b) => a.level < b.level ? a : b);
  let avgSkill = student.skills.reduce((sum,s) => sum + s.level, 0) / student.skills.length;
  let analysisHTML = `
    <h3>📈 Analysis</h3>
    <p>✅ Strongest Skill: <b>${maxSkill.name}</b> (${maxSkill.level}%)</p>
    <p>⚠️ Weakest Skill: <b>${minSkill.name}</b> (${minSkill.level}%)</p>
    <p>📊 Average Skill Level: <b>${avgSkill.toFixed(1)}%</b></p>
  `;
  let recommendations = '<h3>💡 Recommendations</h3>';
  if (minSkill.level < 40) {
    recommendations += `<p>📉 Focus on improving <b>${minSkill.name}</b>. Try resources like <a href="https://www.w3schools.com/">W3Schools</a> or <a href="https://www.geeksforgeeks.org/">GeeksforGeeks</a>.</p>`;
  }
  if (maxSkill.level > 80 && minSkill.level < 50) {
    recommendations += `<p>⚖️ Your <b>${maxSkill.name}</b> is strong, but <b>${minSkill.name}</b> needs more work.</p>`;
  }
  if (avgSkill > 80) {
    recommendations += `<p>🌟 Excellent performance! Try learning advanced topics.</p>`;
  } else if (avgSkill < 50) {
    recommendations += `<p>🚀 Keep going! Set small daily goals.</p>`;
  } else {
    recommendations += `<p>📚 You’re doing well! Keep practicing.</p>`;
  }
  analysisDiv.innerHTML = analysisHTML + recommendations;
}

// ---------- Chart ----------
function updateChart(student) {
  const canvas = document.getElementById('skillsChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const labels = (student.skills || []).map(skill => skill.name);
  const data = (student.skills || []).map(skill => skill.level);
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Skill Levels (%)',
        data: data,
        backgroundColor: labels.map((_,i) => ['#4CAF50','#2196F3','#FF9800','#E91E63','#9C27B0','#031b82ff'][i % 6])
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, max: 100 } }
    }
  });
}

// ---------- MCQ Pool (20+ per main skill) ----------
const skillBasedQuestions = {
  "Javascript": [
    { q: "Which keyword is used to declare a variable in JS?", options: ["var","let","const","declare"], answer: "let" },
    { q: "Which function converts JSON text to an object?", options: ["JSON.parse()","JSON.stringify()","parseJSON()","toObject()"], answer: "JSON.parse()" },
    { q: "What is the output of typeof NaN?", options: ["number","undefined","object","NaN"], answer: "number" },
    { q: "Which symbol starts a single-line comment?", options: ["//","/*","#","<!--"], answer: "//" },
    { q: "How to show an alert box?", options: ["alert('Hi')","console.log('Hi')","msg('Hi')","print('Hi')"], answer: "alert('Hi')" },
    { q: "Which method adds element to end of array?", options: ["push()","pop()","shift()","unshift()"], answer: "push()" },
    { q: "Which operator checks both value and type?", options: ["==","===","!=","="], answer: "===" },
    { q: "Which method converts an object to JSON string?", options: ["JSON.stringify()","JSON.parse()","toString()","toJSON()"], answer: "JSON.stringify()" },
    { q: "Which loop runs at least once?", options: ["for","while","do...while","foreach"], answer: "do...while" },
    { q: "Which statement handles exceptions?", options: ["try...catch","if...else","switch","throw"], answer: "try...catch" },
    { q: "What does DOM stand for?", options: ["Document Object Model","Data Object Map","Display Object Model","Document Order Model"], answer: "Document Object Model" },
    { q: "Which method finds index of element?", options: ["indexOf()","findIndex()","getIndex()","search()"], answer: "indexOf()" },
    { q: "Which keyword creates a constant?", options: ["let","var","const","constant"], answer: "const" },
    { q: "Which is NOT a primitive type?", options: ["number","string","object","boolean"], answer: "object" },
    { q: "Which method removes last element?", options: ["pop()","shift()","slice()","splice()"], answer: "pop()" },
    { q: "Which returns true if all array items pass test?", options: ["every()","some()","filter()","map()"], answer: "every()" },
    { q: "Which adds one element at beginning?", options: ["unshift()","push()","shift()","splice()"], answer: "unshift()" },
    { q: "Which prints to console?", options: ["console.log()","print()","echo()","write()"], answer: "console.log()" },
    { q: "Which creates an array?", options: ["[]","{}","()","<>"], answer: "[]" },
    { q: "What does NaN stand for?", options: ["Not a Number","Null and None","Number and NaN","Not available Number"], answer: "Not a Number" }
  ],
  "Html": [
  { q: "Which tag is used for the largest heading?", options: ["&lt;h1&gt;", "&lt;h6&gt;", "&lt;head&gt;", "&lt;title&gt;"], answer: "&lt;h1&gt;" },
  { q: "Which tag defines a hyperlink?", options: ["&lt;a&gt;", "&lt;link&gt;", "&lt;href&gt;", "&lt;url&gt;"], answer: "&lt;a&gt;" },
  { q: "What does &lt;br&gt; do?", options: ["Line break", "Bold text", "Space", "None"], answer: "Line break" },
  { q: "Which tag inserts an image?", options: ["&lt;img&gt;", "&lt;image&gt;", "&lt;pic&gt;", "&lt;src&gt;"], answer: "&lt;img&gt;" },
  { q: "Which tag contains metadata?", options: ["&lt;head&gt;", "&lt;body&gt;", "&lt;title&gt;", "&lt;footer&gt;"], answer: "&lt;head&gt;" },
  { q: "Which tag defines a paragraph?", options: ["&lt;p&gt;", "&lt;para&gt;", "&lt;text&gt;", "&lt;pg&gt;"], answer: "&lt;p&gt;" },
  { q: "Which tag defines a table row?", options: ["&lt;tr&gt;", "&lt;td&gt;", "&lt;th&gt;", "&lt;table&gt;"], answer: "&lt;tr&gt;" },
  { q: "Which tag represents an unordered list?", options: ["&lt;ul&gt;", "&lt;ol&gt;", "&lt;li&gt;", "&lt;list&gt;"], answer: "&lt;ul&gt;" },
  { q: "Which tag defines a checkbox?", options: ["&lt;input type='checkbox'&gt;", "&lt;checkbox&gt;", "&lt;check&gt;", "&lt;cb&gt;"], answer: "&lt;input type='checkbox'&gt;" },
  { q: "How to add an HTML comment?", options: ["&lt;!-- comment --&gt;", "// comment", "/* comment */", "# comment"], answer: "&lt;!-- comment --&gt;" },
  { q: "Which tag is for bold text?", options: ["&lt;strong&gt;", "&lt;b&gt;", "&lt;em&gt;", "&lt;i&gt;"], answer: "&lt;strong&gt;" },
  { q: "Which element contains the title shown in browser tab?", options: ["&lt;title&gt;", "&lt;head&gt;", "&lt;meta&gt;", "&lt;header&gt;"], answer: "&lt;title&gt;" },
  { q: "Which attribute is used for image source?", options: ["src", "href", "link", "ref"], answer: "src" },
  { q: "Which tag is used for input fields?", options: ["&lt;input&gt;", "&lt;form&gt;", "&lt;field&gt;", "&lt;control&gt;"], answer: "&lt;input&gt;" },
  { q: "Which element groups related form controls?", options: ["&lt;fieldset&gt;", "&lt;div&gt;", "&lt;group&gt;", "&lt;form&gt;"], answer: "&lt;fieldset&gt;" },
  { q: "Which tag is used for ordered list?", options: ["&lt;ol&gt;", "&lt;ul&gt;", "&lt;li&gt;", "&lt;list&gt;"], answer: "&lt;ol&gt;" },
  { q: "Which attribute opens link in new tab?", options: ["target='_blank'", "new='tab'", "open='_new'", "href='_blank'"], answer: "target='_blank'" },
  { q: "Which tag defines table data cell?", options: ["&lt;td&gt;", "&lt;tr&gt;", "&lt;th&gt;", "&lt;table&gt;"], answer: "&lt;td&gt;" },
  { q: "Which tag embeds video?", options: ["&lt;video&gt;", "&lt;media&gt;", "&lt;mp4&gt;", "&lt;source&gt;"], answer: "&lt;video&gt;" },
  { q: "Which tag is semantic for page footer?", options: ["&lt;footer&gt;", "&lt;bottom&gt;", "&lt;end&gt;", "&lt;section&gt;"], answer: "&lt;footer&gt;" }
]
,
"Css": [
  { q: "Which property is used to change the background color?", options: ["color", "background-color", "bgcolor", "back-color"], answer: "background-color" },
  { q: "Which property controls the text size?", options: ["font-size", "text-size", "font-style", "text-height"], answer: "font-size" },
  { q: "Which value of position makes an element stick to the viewport when you scroll?", options: ["relative", "fixed", "sticky", "absolute"], answer: "sticky" },
  { q: "Which CSS property is used to add space inside an element?", options: ["margin", "padding", "border", "gap"], answer: "padding" },
  { q: "Which property changes the text color?", options: ["font-color", "text-color", "color", "foreground"], answer: "color" },
  { q: "Which property adds shadow to text?", options: ["text-decoration", "text-shadow", "font-shadow", "shadow"], answer: "text-shadow" },
  { q: "Which property is used to change the font of text?", options: ["font-family", "font-style", "font-weight", "font-type"], answer: "font-family" },
  { q: "Which property specifies the spacing between letters?", options: ["letter-spacing", "word-spacing", "line-height", "space"], answer: "letter-spacing" },
  { q: "Which property changes the order of flex items?", options: ["order", "flex-order", "item-index", "z-index"], answer: "order" },
  { q: "What does z-index control?", options: ["Stacking order", "Font size", "Transparency", "Position"], answer: "Stacking order" },
  { q: "Which property creates rounded corners?", options: ["border-radius", "corner", "round", "curve"], answer: "border-radius" },
  { q: "Which property hides overflow content?", options: ["overflow", "clip", "hidden", "display"], answer: "overflow" },
  { q: "Which display value hides an element?", options: ["none", "hidden", "invisible", "no-display"], answer: "none" },
  { q: "Which property makes text bold?", options: ["font-weight", "bold", "text-bold", "weight"], answer: "font-weight" },
  { q: "Which unit is relative to the root element font size?", options: ["em", "px", "rem", "%"], answer: "rem" },
  { q: "Which property defines space between lines?", options: ["line-height", "letter-spacing", "text-indent", "gap"], answer: "line-height" },
  { q: "Which property changes the cursor style?", options: ["cursor", "pointer", "hover", "style"], answer: "cursor" },
  { q: "Which property makes a box flexible?", options: ["display:flex", "flex", "flexbox", "flex-container"], answer: "display:flex" },
  { q: "Which property aligns text horizontally?", options: ["text-align", "justify-content", "align-items", "align-text"], answer: "text-align" },
  { q: "Which selector targets elements by class?", options: [".classname", "#idname", "element", "@class"], answer: ".classname" }
],

"Python": [
  { q: "Which keyword is used to define a function?", options: ["func", "def", "function", "lambda"], answer: "def" },
  { q: "Which data type is immutable?", options: ["list", "set", "dictionary", "tuple"], answer: "tuple" },
  { q: "Which symbol is used for comments in Python?", options: ["//", "#", "/* */", "<!-- -->"], answer: "#" },
  { q: "What is the output of len('Python')?", options: ["5", "6", "7", "error"], answer: "6" },
  { q: "Which function converts a string to lowercase?", options: ["lower()", "tolower()", "downcase()", "str.lowercase()"], answer: "lower()" },
  { q: "Which keyword is used for loops?", options: ["repeat", "for", "iterate", "loop"], answer: "for" },
  { q: "Which function displays output?", options: ["echo()", "display()", "print()", "show()"], answer: "print()" },
  { q: "What is the output of 5//2?", options: ["2.5", "2", "3", "error"], answer: "2" },
  { q: "Which data structure uses key-value pairs?", options: ["list", "tuple", "dictionary", "set"], answer: "dictionary" },
  { q: "What is used to handle exceptions?", options: ["try...except", "catch", "if...else", "handle"], answer: "try...except" },
  { q: "Which keyword creates a class?", options: ["class", "define", "object", "struct"], answer: "class" },
  { q: "Which operator checks equality?", options: ["=", "==", "===", "!="], answer: "==" },
  { q: "What will type(10) return?", options: ["int", "integer", "float", "number"], answer: "int" },
  { q: "Which keyword is used to exit a loop early?", options: ["stop", "exit", "break", "end"], answer: "break" },
  { q: "Which function returns the length of a list?", options: ["len()", "count()", "size()", "length()"], answer: "len()" },
  { q: "Which keyword defines an anonymous function?", options: ["lambda", "def", "func", "none"], answer: "lambda" },
  { q: "Which method adds an item to a list?", options: ["append()", "add()", "insert()", "push()"], answer: "append()" },
  { q: "Which symbol is used for string concatenation?", options: ["+", "&", ",", "."], answer: "+" },
  { q: "What is used to import modules?", options: ["include", "import", "require", "load"], answer: "import" },
  { q: "Which statement is used to stop iteration?", options: ["stop", "halt", "break", "continue"], answer: "break" }
],
"C": [
  { q: "Which keyword is used to declare a variable in C?", options: ["var", "let", "int", "define"], answer: "int" },
  { q: "Which symbol is used to end a statement?", options: [".", ":", ";", ","], answer: ";" },
  { q: "Which header file is required for printf()?", options: ["<stdio.h>", "<conio.h>", "<stdlib.h>", "<string.h>"], answer: "<stdio.h>" },
  { q: "Which data type can store decimal values?", options: ["int", "float", "char", "double"], answer: "float" },
  { q: "Which function is used to read formatted input?", options: ["input()", "scanf()", "cin>>", "read()"], answer: "scanf()" },
  { q: "Which operator is used for equality check?", options: ["==", "=", "===", "!="], answer: "==" },
  { q: "Which keyword is used to create loops?", options: ["for", "loop", "iterate", "repeat"], answer: "for" },
  { q: "What is the index of the first element in an array?", options: ["1", "0", "-1", "Depends"], answer: "0" },
  { q: "Which keyword is used to exit from a loop?", options: ["return", "break", "exit", "stop"], answer: "break" },
  { q: "Which function is used to clear the output screen?", options: ["clrscr()", "clear()", "reset()", "clean()"], answer: "clrscr()" },
  { q: "Which function returns string length?", options: ["strlen()", "size()", "length()", "count()"], answer: "strlen()" },
  { q: "Which operator is used to access memory address?", options: ["*", "&", "@", "%"], answer: "&" },
  { q: "Which storage class defines global variables?", options: ["extern", "auto", "static", "register"], answer: "extern" },
  { q: "What is the size of int on a 32-bit compiler?", options: ["2 bytes", "4 bytes", "8 bytes", "16 bytes"], answer: "4 bytes" },
  { q: "Which loop checks condition after executing?", options: ["for", "while", "do-while", "foreach"], answer: "do-while" },
  { q: "What does the break statement do?", options: ["Skips one iteration", "Stops loop immediately", "Restarts loop", "Ends program"], answer: "Stops loop immediately" },
  { q: "Which function dynamically allocates memory?", options: ["malloc()", "alloc()", "memory()", "getmem()"], answer: "malloc()" },
  { q: "What is the default value of an uninitialized int variable?", options: ["0", "garbage value", "null", "undefined"], answer: "garbage value" },
  { q: "Which operator is used for pointers?", options: ["*", "&", "#", "$"], answer: "*" },
  { q: "Which header file is required for string operations?", options: ["<string.h>", "<stdio.h>", "<stdlib.h>", "<ctype.h>"], answer: "<string.h>" }
]
,
"Java": [
  { q: "Which keyword is used to define a class?", options: ["class", "struct", "define", "object"], answer: "class" },
  { q: "Which method is the entry point of a Java program?", options: ["start()", "init()", "main()", "run()"], answer: "main()" },
  { q: "Which keyword is used to inherit a class?", options: ["extends", "implements", "inherits", "include"], answer: "extends" },
  { q: "Which package contains Scanner class?", options: ["java.io", "java.util", "java.net", "java.lang"], answer: "java.util" },
  { q: "Which symbol is used to end a statement?", options: [".", ":", ";", ","], answer: ";" },
  { q: "Which keyword is used for constant values?", options: ["static", "final", "const", "constant"], answer: "final" },
  { q: "Which operator compares two values?", options: ["==", "=", "equals()", "!="], answer: "==" },
  { q: "Which keyword is used to create an object?", options: ["object", "this", "new", "alloc"], answer: "new" },
  { q: "Which data type stores true/false?", options: ["int", "boolean", "string", "bit"], answer: "boolean" },
  { q: "Which method is used to print in Java?", options: ["echo()", "printf()", "System.out.println()", "display()"], answer: "System.out.println()" },
  { q: "Which keyword prevents inheritance?", options: ["final", "private", "sealed", "static"], answer: "final" },
  { q: "Which collection class allows key-value pairs?", options: ["List", "ArrayList", "HashMap", "Set"], answer: "HashMap" },
  { q: "Which exception is checked at compile time?", options: ["IOException", "ArithmeticException", "NullPointerException", "RuntimeException"], answer: "IOException" },
  { q: "Which operator is used to concatenate strings?", options: ["+", "&", ".", ","], answer: "+" },
  { q: "Which keyword handles exceptions?", options: ["try", "handle", "catch", "except"], answer: "try" },
  { q: "Which loop runs based on a condition?", options: ["for", "while", "repeat", "loop"], answer: "while" },
  { q: "Which modifier allows access in same package?", options: ["default", "private", "public", "protected"], answer: "default" },
  { q: "Which keyword refers to current object?", options: ["this", "self", "me", "current"], answer: "this" },
  { q: "Which method returns length of a string?", options: ["size()", "length()", "count()", "getSize()"], answer: "length()" },
  { q: "Which keyword is used to import packages?", options: ["import", "include", "load", "require"], answer: "import" }
]
,
"React": [
  { q: "React is a ___?", options: ["Library", "Framework", "Language", "Tool"], answer: "Library" },
  { q: "Which command creates a new React app?", options: ["npx create-react-app", "npm new react", "react-init", "yarn react"], answer: "npx create-react-app" },
  { q: "What is JSX?", options: ["JavaScript XML", "JSON extension", "CSS syntax", "None"], answer: "JavaScript XML" },
  { q: "Which hook is used for state in functional components?", options: ["useState", "useEffect", "useContext", "useRef"], answer: "useState" },
  { q: "Which hook is used for side effects?", options: ["useEffect", "useMemo", "useState", "useCallback"], answer: "useEffect" },
  { q: "Which symbol is used for components?", options: ["<Component/>", "#Component", ".Component", "@Component"], answer: "<Component/>" },
  { q: "Which file contains the root component?", options: ["App.js", "Index.js", "Main.js", "Home.js"], answer: "App.js" },
  { q: "What is Virtual DOM?", options: ["Lightweight copy of DOM", "Database", "Library", "Framework"], answer: "Lightweight copy of DOM" },
  { q: "Which function returns HTML in React?", options: ["render()", "return()", "view()", "output()"], answer: "return()" },
  { q: "Which hook is used to manage context?", options: ["useContext", "useReducer", "useState", "useEffect"], answer: "useContext" },
  { q: "What prop keyword is used to pass data?", options: ["props", "value", "data", "input"], answer: "props" },
  { q: "Which method unmounts a component?", options: ["componentWillUnmount", "componentDidMount", "destroy()", "remove()"], answer: "componentWillUnmount" },
  { q: "Which command starts a React project?", options: ["npm start", "node start", "react-run", "yarn dev"], answer: "npm start" },
  { q: "What is returned by a React component?", options: ["JSX", "HTML", "Object", "CSS"], answer: "JSX" },
  { q: "What manages routes in React?", options: ["React Router", "Redux", "Context", "Hooks"], answer: "React Router" },
  { q: "Which function updates state?", options: ["setState", "update()", "modify()", "refresh()"], answer: "setState" },
  { q: "What is React primarily used for?", options: ["Building UIs", "Databases", "Server-side apps", "System scripting"], answer: "Building UIs" },
  { q: "Which syntax imports modules?", options: ["import", "require", "include", "load"], answer: "import" },
  { q: "Which file contains dependencies?", options: ["package.json", "index.html", "app.js", "config.js"], answer: "package.json" },
  { q: "What is the default port for React?", options: ["3000", "5000", "8080", "4000"], answer: "3000" }
]


};

function pickNRandom(arr, n) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  if (n >= copy.length) return copy.slice();
  return copy.slice(0, n);
}

function startAssignment() {
  if (selectedStudentIndex === null) { alert('⚠️ Please select a student first!'); return; }
  const student = students[selectedStudentIndex];
  if (!student.skills.length) { alert('⚠️ Add some skills before starting the assignment!'); return; }

  const weakestSkill = student.skills.reduce((min, s) => s.level < min.level ? s : min, student.skills[0]);
  const skillName = weakestSkill.name;
  const pool = skillBasedQuestions[skillName] || skillBasedQuestions['HTML'];

  currentQuestions = pickNRandom(pool, 20);

  document.getElementById('assignmentArea').style.display = 'block';
  document.getElementById('assignmentTitle').innerText = `Assignment on ${skillName}`;
  document.getElementById('assignmentResult').innerHTML = '';
  document.getElementById('submitAssignmentBtn').style.display = 'block';

  const mcqContainer = document.getElementById('mcqContainer');
  mcqContainer.innerHTML = '';

  currentQuestions.forEach((item, index) => {
    const div = document.createElement('div');
    div.classList.add('mcq-question');
    div.innerHTML = `
      <p><b>Q${index + 1}:</b> ${item.q}</p>
      ${item.options.map(opt => `
        <label>
          <input type="radio" name="q${index}" value="${opt}"> ${opt}
        </label>
      `).join('')}
    `;
    mcqContainer.appendChild(div);
  });
}

function submitAssignment() {
  if (selectedStudentIndex === null) { alert('⚠️ Please select a student first!'); return; }
  const student = students[selectedStudentIndex];
  const title = document.getElementById('assignmentTitle').innerText;
  const skillName = title.replace('Assignment on ', '').trim();
  if (!currentQuestions.length) { alert('⚠️ No active assignment. Start assignment first.'); return; }

  let correct = 0;
  currentQuestions.forEach((q, i) => {
    const sel = document.querySelector(`input[name="q${i}"]:checked`);
    if (sel && sel.value === q.answer) correct += 1;
  });

  const percentage = Math.round((correct / currentQuestions.length) * 100);
  const date = new Date().toLocaleString();

  student.assignmentHistory = student.assignmentHistory || [];
  student.assignmentHistory.push({ date, skill: skillName, score: percentage });

  const skill = student.skills.find(s => s.name === skillName);
  if (skill) skill.level = Math.min(100, Math.round(skill.level + percentage * 0.3));

  localStorage.setItem('students', JSON.stringify(students));

  document.getElementById('assignmentResult').innerHTML =
    `✅ You answered ${correct} out of ${currentQuestions.length} correctly.<br>📊 Score: <b>${percentage}%</b><br>Graph & history updated.`;

  document.getElementById('assignmentArea').style.display = 'none';
  document.getElementById('submitAssignmentBtn').style.display = 'none';
  currentQuestions = [];
  updateDashboard();
}

function renderAssignmentHistory(student) {
  const body = document.getElementById('assignmentHistoryBody');
  body.innerHTML = '';
  if (!student.assignmentHistory || student.assignmentHistory.length === 0) {
    body.innerHTML = '<tr><td colspan="3">No assignments completed yet.</td></tr>';
    return;
  }
  student.assignmentHistory.slice().reverse().forEach(rec => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${rec.date}</td><td>${rec.skill}</td><td>${rec.score}%</td>`;
    body.appendChild(row);
  });
}

renderStudentList();
