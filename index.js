const openModal = document.querySelector('#triggerModal')
const modal = document.querySelector('.modal');

openModal.addEventListener('click',()=>{
    modal.classList.add('is-active')
})
function closeModal(){
    modal.classList.remove('is-active');
}

document.querySelector('.modal-background').addEventListener(
    'click', closeModal)
document.querySelector('.delete').addEventListener(
    'click', closeModal)
