document.addEventListener('DOMContentLoaded', function () {
    const openSidebarButton = document.getElementById('open-sidebar');
    const closeSidebarButton = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');

    // Open sidebar
    openSidebarButton.addEventListener('click', () => {
        sidebar.classList.add('open');
    });

    // Close sidebar
    closeSidebarButton.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });
});
