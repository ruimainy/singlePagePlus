;
$(function() {
    UserDataMagnagerPlugin();
});

function UserDataMagnagerPlugin() {
    var ActionURL = {
        GetUserByPage: UrlContent('/MainData/GetUserByPage'),
    }
    var linkType = {
        _text: 1,
        _img: 2
    };
    var config = {
        Titles: [{
            title: 'EmployeeId',
            field: 'EmployeeId'
        }, {
            title: 'DisplayName',
            field: 'DisplayName'
        }, {
            title: 'BUName',
            field: 'BUName'
        }, {
            title: '操作',
            cellFn: function(t) {
                return (t.UserState == 2) ? '解锁' : '锁定';
            }
        }],
        schema: {
            data: 'Data',
            total: 'Total'
        },
        pageNum: {
            indexChangeCb: function(index) {
                $.ajax({
                    url: ActionURL.GetUserByPage + '?pageSize=' + config.pageNum.pageSize + '&pageIndex=' + index,
                    type: 'get',
                    dataType: 'json',
                    success: function(d) {
                        UserTable.setData(index, d);
                    }
                });
            },
            pageSize: 5
        },
        expand: {
            title: '详情',
            type: linkType._img,
            text: "展开",
            iconUrlOpen: 'Library/idb/images/openUpIcon_1.jpg',
            iconUrlClose: 'Library/idb/images/openUpIcon_2.jpg',
            expandDiv: function(e) {}
        },
        checkable: {
            c_class: 'chkClass',
            title: ''
        }
    };
    var UserTable = $('#User_table').idb_Table(config);
    $.ajax({
        url: ActionURL.GetUserByPage + '?pageSize=' + config.pageNum.pageSize + '&pageIndex=' + 1,
        type: 'get',
        success: function(d) {
            UserTable.setData(1, d);
        }
    });

    var createClosed = true;
    $('#link_createLevel').click(function() {
        if(createClosed == false) return;

        var cloneDiv = $('.userInfoDetail').eq(0).clone();
        var $tr = $('<tr>', {
            "class": "tr_addUserDetail"
        });
        $tr.append($('<td>', {
            "colspan": "6"
        }));
        $tr.find('td').append(cloneDiv);
        $('#User_table table tbody').prepend($tr);
        cloneDiv.fadeIn(1000);

        var config = {
            div: cloneDiv,
            createComplete: function() {
                refreshUserTable();
                createClosed = true;
            },
            createCancel: function() {
                $tr.remove();
                createClosed = true;
            }
        }
        getUserDetailInfo(config);
        createClosed = false;
    });

    function getUserDetailInfo(config) {
        var cloneDiv = config.div;
        var ActionURL = {
            CheckIdmUser: UrlContent('/MainData/CheckIdmUser'),
            CreateUser: UrlContent('/MainData/CreateUser')
        };

        function BindingEvent() {
            var employeeVal, _btn, commitBtn, cancelBtn;
            var $ul = cloneDiv.find( $('ul') ).eq(0);
            var errorMessage = $("<div/>",{}).appendTo( cloneDiv );
            var MessageInfo = $("<div/>",{'style':'display:none;'}).html('请输入正确 EmployeeId').appendTo( errorMessage );
            var MessageInfo2 = $("<div/>",{'style':'display:none;'}).html('user 已经存在').appendTo( errorMessage );

            var userData;
            var $EmployeeIdTxt = cloneDiv.find( $('.EmployeeIdTxt') );
            var $DisplayNameInputTxt = cloneDiv.find( $('input[name=DisplayNameInputTxt]') );
            var $FirstNameInputTxt = cloneDiv.find( $('input[name=FirstNameInputTxt]') );
            var $PasswordInputTxt = cloneDiv.find( $('input[name=PasswordInputTxt]') );
            var $LastNameInputTxt = cloneDiv.find( $('input[name=LastNameInputTxt]') );

            employeeVal = $('input[name=employeeIdText]');
            _btn = $('input[name=getEmployeeInfo]');
            commitBtn = $('input[name=postUserObj]');
            cancelBtn = $('input[name=cancelCreateBtn]');

            var errorCode = {
                EmployeeIdErrorCode: '-100',
                aleradyExistErrorCode: '-110'
            }

            _btn.click(function() {

                $.ajax({
                    url: ActionURL.CheckIdmUser + '?employeeid=' + employeeVal.val(),
                    type: 'get',
                    success: function(d) {
                        if(d.Error != null){
                            if(errorCode.EmployeeIdErrorCode == d.Error.Code){
                                MessageInfo.show();
                                MessageInfo2.hide();
                            }
                            if(errorCode.aleradyExistErrorCode == d.Error.Code){
                                MessageInfo2.show();
                                MessageInfo.hide();
                            }
                            $ul.hide();
                            return
                        } else {
                            MessageInfo.hide();
                            MessageInfo2.hide();
                        }

                        $ul.show();
                        $EmployeeIdTxt.html( d.Data.WWID );
                        $DisplayNameInputTxt.val( d.Data.CName );
                        $FirstNameInputTxt.val( d.Data.CName );
                        $PasswordInputTxt.val( '123' );
                        $LastNameInputTxt.val( d.Data.CName );
                        userData = d.Data;

                    },
                    error: function(msg){
                        console.log(msg)
                    }
                });
            });

            commitBtn.click(function(){
                var userEditInfo = {

                        'EmployeeId' : userData.WWID, 
                        'DisplayName' : $DisplayNameInputTxt.val(), 
                        'FirstName' : $FirstNameInputTxt.val(), 
                        'Password' : $PasswordInputTxt.val(), 
                        'LastName' : $LastNameInputTxt.val()

                    };

                $.ajax({
                    url: ActionURL.CreateUser,
                    type: 'POST',
                    dataType: 'json',
                    data:  userEditInfo,
                    success: function(msg){
                        config.createComplete();
                        $ul.hide();
                    },
                    error:function(msg){
                        console.log('err');
                    }
                });
            });

            cancelBtn.click(function() {
                config.createCancel();
            });
        }
        BindingEvent();
    }

    function refreshUserTable(){
        $.ajax({
            url: ActionURL.GetUserByPage + '?pageSize=' + config.pageNum.pageSize + '&pageIndex=' + 1,
            type: 'get',
            success: function(d) {
                UserTable.setData(1, d);
            }
        });
    }

}