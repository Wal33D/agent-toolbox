let tools = [];

const renderTools = (toolsToRender) => {
    const toolsContainer = document.getElementById('toolsContainer');
    toolsContainer.innerHTML = '';

    toolsToRender.forEach(tool => {
        const toolItem = document.createElement('div');
        toolItem.className = 'tool-item';
        toolItem.innerHTML = `
            <span class="tool-icon">🔧</span>
            <span class="tool-name">${tool.function.name}</span>
            <span class="tool-description">${tool.function.description}</span>
        `;
        toolItem.onclick = () => openModal(tool);
        toolsContainer.appendChild(toolItem);
    });

    if (toolsToRender.length === 0) {
        toolsContainer.innerHTML = '<p class="no-tools">No tools found</p>';
    }
};

const openModal = (tool) => {
    document.getElementById('modalTitle').textContent = tool.function.name;
    document.getElementById('modalDescription').textContent = tool.function.description;

    const parameters = tool.function.parameters.properties;
    const modalParameters = document.getElementById('modalParameters');
    modalParameters.innerHTML = '';

    for (const param in parameters) {
        const paramItem = document.createElement('li');
        paramItem.textContent = `${param}: ${parameters[param].description}`;
        modalParameters.appendChild(paramItem);
    }

    const modal = document.getElementById('myModal');
    modal.style.display = 'block';
};

const closeModal = () => {
    const modal = document.getElementById('myModal');
    modal.style.display = 'none';
};

document.querySelector('.close').onclick = closeModal;
window.onclick = (event) => {
    const modal = document.getElementById('myModal');
    if (event.target === modal) {
        closeModal();
    }
};

const fetchTools = async () => {
    try {
        const res = await fetch('/api/toolsHandler', { method: 'OPTIONS' });
        const data = await res.json();
        tools = data.tools || [];
        renderTools(tools);
    } catch (err) {
        console.error('Failed to fetch tools', err);
    }
};

fetchTools();

document.getElementById('searchBar').addEventListener('input', function() {
    const searchValue = this.value.toLowerCase();
    if (searchValue.length < 2) {
        renderTools(tools);
        return;
    }

    const filteredTools = tools.filter(tool => {
        return tool.function.name.toLowerCase().includes(searchValue) ||
               tool.function.description.toLowerCase().includes(searchValue);
    });

    renderTools(filteredTools);
});
