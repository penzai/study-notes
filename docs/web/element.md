## form
- 非type=button的button会被当作提交按钮提交表单
- 使用$form.submit()方法提交，是不会触发form的submit事件的
- 阻止的只能阻止默认提交的行为，并不能阻止提交后跳转的行为
