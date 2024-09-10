import "./loading.html";

Template.loading.helpers({
    isLoading: () => Session.get('loading')
})