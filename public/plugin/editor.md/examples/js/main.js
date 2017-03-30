requirejs.config({
                // baseUrl: "/editor.md/",
                paths: {
                    jquery          : "jquery.min",
                    marked          : "../../lib/marked.min",
                    prettify        : "../../lib/prettify.min",
                    raphael         : "../../lib/raphael.min",
                    underscore      : "../../lib/underscore.min",
                    flowchart       : "../../lib/flowchart.min", 
                    jqueryflowchart : "../../lib/jquery.flowchart.min", 
                    sequenceDiagram : "../../lib/sequence-diagram.min",
                    katex           : "//cdnjs.cloudflare.com/ajax/libs/KaTeX/0.1.1/katex.min",
                    editormd        : "../../editormd.amd" // Using Editor.md amd version for Require.js
                },
                shim: {
                    jqueryflowchart: ["jquery"]
                },
                waitSeconds: 30
            });
            
            var deps = [
                "editormd", 
                // "../../languages/en", 
                "../../plugins/link-dialog/link-dialog",
                "../../plugins/reference-link-dialog/reference-link-dialog",
                "../../plugins/image-dialog/image-dialog",
                "../../plugins/code-block-dialog/code-block-dialog",
                "../../plugins/table-dialog/table-dialog",
                "../../plugins/emoji-dialog/emoji-dialog",
                "../../plugins/goto-line-dialog/goto-line-dialog",
                "../../plugins/help-dialog/help-dialog",
                "../../plugins/html-entities-dialog/html-entities-dialog", 
                "../../plugins/preformatted-text-dialog/preformatted-text-dialog"
            ];
            
            var testEditor;
                
            require(deps, function(editormd) {
                
                // if enable codeFold
                // or <link rel="stylesheet" href="../lib/codemirror/addon/fold/foldgutter.css" />
                // editormd.loadCSS("../../lib/codemirror/addon/fold/foldgutter");
                
                // $.get('test.md', function(md) {
                    testEditor = editormd("test-editormd", {
                        width: "90%",
                        height: 640,
                        path : '/editor.md/lib/',
                        // markdown : md,
                        codeFold : true,
                        searchReplace : true,
                        saveHTMLToTextarea : true,                // 保存HTML到Textarea
                        htmlDecode : "style,script,iframe|on*",       // 开启HTML标签解析，为了安全性，默认不开启    
                        emoji : true,
                        taskList : true,
                        tex : true,
                        tocm            : true,         // Using [TOCM]
                        autoLoadModules : false,
                        previewCodeHighlight : true,
                        flowChart : true,
                        sequenceDiagram : true,
                        //dialogLockScreen : false,   // 设置弹出层对话框不锁屏，全局通用，默认为true
                        //dialogShowMask : false,     // 设置弹出层对话框显示透明遮罩层，全局通用，默认为true
                        //dialogDraggable : false,    // 设置弹出层对话框不可拖动，全局通用，默认为true
                        //dialogMaskOpacity : 0.4,    // 设置透明遮罩层的透明度，全局通用，默认值为0.1
                        //dialogMaskBgColor : "#000", // 设置透明遮罩层的背景颜色，全局通用，默认为#fff
                        imageUpload : true,
                        imageFormats : ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
                        imageUploadURL : "./php/upload.php",
                        onload : function() {
                            console.log('onload', this);
                            //this.fullscreen();
                            //this.unwatch();
                            //this.watch().fullscreen();

                            //this.setMarkdown("#PHP");
                            //this.width("100%");
                            //this.height(480);
                            //this.resize("100%", 640);
                        }
                    });
                // });

                $("#show-btn").bind('click', function(){
                    testEditor.show();
                });

                $("#hide-btn").bind('click', function(){
                    testEditor.hide();
                });

                $("#get-md-btn").bind('click', function(){
                    alert(testEditor.getMarkdown());
                });

                $("#get-html-btn").bind('click', function() {
                    alert(testEditor.getHTML());
                });                

                $("#watch-btn").bind('click', function() {
                    testEditor.watch();
                });                 

                $("#unwatch-btn").bind('click', function() {
                    testEditor.unwatch();
                });              

                $("#preview-btn").bind('click', function() {
                    testEditor.previewing();
                });

                $("#fullscreen-btn").bind('click', function() {
                    testEditor.fullscreen();
                });

                $("#show-toolbar-btn").bind('click', function() {
                    testEditor.showToolbar();
                });

                $("#close-toolbar-btn").bind('click', function() {
                    testEditor.hideToolbar();
                });
                
                $("#toc-menu-btn").click(function(){
                    testEditor.config({
                        tocDropdown   : true,
                        tocTitle      : "目录 Table of Contents",
                    });
                });
                
                $("#toc-default-btn").click(function() {
                    testEditor.config("tocDropdown", false);
                });
            });