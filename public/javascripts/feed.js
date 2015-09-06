/**
 * Created by akshat on 6/9/15.
 */


var Feed = function(){

    var self= this;
    var token = (function(){
        console.log('getting token');
        return localStorage.getItem("token");
    })();

    var hackerRootUrl = 'https://news.ycombinator.com/';

    self.getFeed = function(callback){
        if(token) {
            $.ajax({
                type: 'GET',
                url: 'api/v1/user/feed',
                dataType: 'json',
                encode: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + token);
                },
                success: function (feedItems) {
                    if (feedItems && feedItems.length) {
                        feedItems.forEach(function (element) {
                            try {
                                var html,
                                    link = element.hackerUrl ? hackerRootUrl + element.hackerUrl : '#',
                                    title = element.title,
                                    commentCount = element.comments,
                                    upvoteCount = element.upvotes,
                                    _id = element._id,


                                    html = '<li class="list-group-item" id="post-' + _id + '"><div><p>'
                                        + '<span>'
                                        + '<a target="new" href="' + link + '">' + title + '</a>'
                                        + '</span>'
                                        + '<br>'
                                        + '<span>' + commentCount + ' comments, </span><span>' + upvoteCount + ' votes</span>';
                                if (!element.read) {
                                    html += '<button class="btn-info btn-mini read-button" id="btn-read-' + _id + '" style="margin:10px; float:right">read</button>'
                                } else {
                                    console.log('read');
                                }
                                html += '<button class="btn-error btn-mini delete-button" id="btn-delete-' + _id + '" style="margin:10px; float:right">delete</button>'
                                    + '</p></div></li>';
                                $("#mainList").append(html);
                            }catch(err){
                                return;
                            }
                        });
                        return callback(1);
                    }

                },
                error: function (xhr, textStatus, errorThrown) {
                    if (xhr.responseJSON && xhr.responseJSON.error) {
                        console.log(xhr.responseJSON.error);
                    } else {
                        console.log(xhr.responseText)
                    }
                }
            });
        }else{
            window.location.href = "login";
        }
    };

    self.action = function(postId,action){
        $.ajax({
            type: 'POST',
            url: 'api/v1/user/'+action+'/'+postId,
            encode: true,
            beforeSend: function (xhr) {
                xhr.setRequestHeader ("Authorization", "Bearer "+ token);
                $("#btn-"+action+"-"+postId).hide();
            },
            success: function(data){
                if(data && data.success){
                    $("#btn-"+action+"-"+postId).remove();
                    if(action === 'delete'){
                        $("#post-"+postId).remove();
                    }
                }
            },
            error: function(xhr, textStatus, errorThrown){
                if(xhr.responseJSON && xhr.responseJSON.error){
                    console.log(xhr.responseJSON.error);
                    $("#btn-"+action+"-"+postId).show();
                }else{
                    console.log(xhr.responseText)
                }
            }
        });
    };

    self.isAdmin = function(callback){
        $.ajax({
            type: 'GET',
            url: 'api/v1/user/me',
            encode: true,
            beforeSend: function (xhr) {
                xhr.setRequestHeader ("Authorization", "Bearer "+ token);
            },
            success: function(data){
                if(data && data.role){
                    if(data.role=='admin'){
                        html = '<div class="col-md-6 adminBtn">'
                            +'<button class="btn-success btn-mini crawl-button" id="crawl-button" style="margin:20px; float:right">Crawl</button>'
                            +'</div>';
                        $("#topRow").append(html);
                        return callback(1);
                    }else{
                        return callback(0);
                    }
                }else{
                    return callback(0);
                }
            },
            error: function(xhr, textStatus, errorThrown){
                if(xhr.responseJSON && xhr.responseJSON.error){
                    console.log(xhr.responseJSON.error);
                }else{
                    console.log(xhr.responseText)
                }
            }
        });
    };

    self.crawl= function(callback){
        $.ajax({
            type: 'POST',
            url: 'api/v1/user/crawl',
            encode: true,
            beforeSend: function (xhr) {
                xhr.setRequestHeader ("Authorization", "Bearer "+ token);
            },
            success: function(data){
                if(data && data.success){
                    return callback(1);
                }else{
                    return callback(0);
                }
            },
            error: function(xhr, textStatus, errorThrown){
                if(xhr.responseJSON && xhr.responseJSON.error){
                    console.log(xhr.responseJSON.error);
                }else{
                    console.log(xhr.responseText)
                }
            }
        });
    };

    return self;
};

var feed = new Feed();

$(document).ready(function(){

    feed.getFeed(function(status){

        $(".read-button" ).click(function() {
            var id = $(this).attr('id');
            id = id.split('-')[2];
            feed.action(id, 'read');
        });

        $(".delete-button" ).click(function() {
            var id = $(this).attr('id');
            id = id.split('-')[2];
            feed.action(id, 'delete');
        });
    });

    feed.isAdmin(function(admin){
        if(admin){
            console.log('I am admin')
            $("#crawl-button").click(function(){
                feed.crawl(function(status){
                    if(status ===1){
                        window.location.reload();
                    }else{
                        alert('error in crawling');
                    }
                })
            });
        }else{
            console.log('not an admin');
        }
    })
});

