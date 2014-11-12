// if we fail submitting a comment, re-load the comment data
(function () {
    try {
        var editor = CKEDITOR.replace('commentText');
        editor.on('instanceReady', function() {
            var data = $('#submittedCommentText').html();
            editor.setData(data);
        });
    } catch (e) {
        console.log(e);
    };
})();

// edit thread modal
(function () {
    $('#editThread').click(function() {

        // load editor with current thread text
        var editor = CKEDITOR.instances['editThreadText'];
        var data = $('#threadText').html();
        editor.setData(data);
        $('#editThreadModal').modal();
    });
})();

// delete thread modal
(function () {
    $('#deleteThread').click(function() {
        $('#deleteThreadModal').modal();
    });
})();

// edit comment modal
(function () {
    $('.editComment').click(function() {

        // get comment id and current comment text
        var commentId = $(this).attr('data-comment-id');
        var commentData = $('#' + commentId).html();

        // update editor with existing comment text
        var editor = CKEDITOR.instances['editCommentText'];
        editor.setData(commentData);

        // update modal form with correct comment id
        $('#editCommentModal').find("input[name=commentId]").attr("value", commentId);
        $('#editCommentModal').modal();
    });
})();

// delete comment modal
(function () {
    $('.deleteComment').click(function() {
        // Find the id of the clicked comment and insert that into the modal form
        var commentId = $(this).attr('data-comment-id');
        $('#deleteCommentModal').find("input[name=commentId]").attr("value", commentId);
        $('#deleteCommentModal').modal();
    });
})();

// magic snippet to make the ckeditor modal work in a bootstrap modal
(function () {
    $.fn.modal.Constructor.prototype.enforceFocus = function() {
        var modal_this = this
        $(document).on('focusin.modal', function (e) {
          if (modal_this.$element[0] !== e.target && !modal_this.$element.has(e.target).length
          && !$(e.target.parentNode).hasClass('cke_dialog_ui_input_select')
          && !$(e.target.parentNode).hasClass('cke_dialog_ui_input_text')) {
            modal_this.$element.focus()
          }
        })
    }
})();