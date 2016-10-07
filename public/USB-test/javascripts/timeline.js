/**
 * Created by RKREYMER on 23-4-2015.
 */
var timeline = {
    //size of pixel step between columns
    marginLeftStep: 1,
    //column default width
    columnWidth: 40,
    //absolute value in px in height for each commit
    commitAppend: 30,
    //default timeline height
    timelineHeight: 0,
    commentsMaxHeight: 50,
    commentStep: 10,
    //words
    labels: {thisweek:"This&nbsp;week",
             lastweek:"Last&nbsp;week",
             weeksago: "&nbsp;weeks&nbsp;ago",
             days: "Days",
             nothingtoshow: "Nothing at this period",
             filenotchanged: "No changes at this moment",
             filechangedonce: "This file was changed once",
             filechanged: "This file was changed ",
             times: " times",
             addDescription: "Add description"},
    //stages color and types description
    stages: {design:{type:"design", color: "rgba(91,176,216,0.8)", colorHover: "rgba(91,176,216,1)"},
        designinactive:{type:"design-inactive", color: "rgba(193,193,193,0.8)", colorHover: "rgba(193,193,193,1)"},
        deliver:{type:"deliver", color: "rgba(141,82,188,0.8)", colorHover: "rgba(141,82,188,1)"},
        deliverinactive:{type:"deliver-inactive", color: "rgba(163,163,163,0.8)", colorHover: "rgba(163,163,163,1)"},
        discover:{type:"discover", color: "rgba(114,175,61,0.8)", colorHover: "rgba(114,175,61,1)"},
        discoverinactive:{type:"discover-inactive", color: "rgba(143,143,143,0.8)", colorHover: "rgba(143,143,143,1)"},
        inactive:{type:"inactive", color: "rgba(150,150,150,0.8)", colorHover: "rgba(150,150,150,1)"},
        comments:{type:"comments", color: "rgba(255,255,255,0.2)", new: "rgba(255,160,0,1)", colorHover: "rgba(255,255,255,0.3)", text: "rgba(255,255,255,0.5)", textnew: "rgba(0,0,0,1)"},
        none:{type:"unknown", color: "rgba(120,120,120,0.8)", colorHover: "rgba(120,120,120,1)"},
        searchHide: {color: "rgba(255,255,255,0.075)"},
        unknown:{type:"unknown", color: "rgba(120,120,120,0.8)", colorHover: "rgba(120,120,120,1)"},
        separator:{color: "rgba(255,255,255,0.2)"}},
    //settings what to show
    settings: {design:{show: true},deliver:{show: true},discover:{show: true}, view:{days: true}},
    //selected date
    selectedDate: new Date(),
    //selected week
    currentWeek: "This&nbsp;week",
    //animation in a process
    animation: false,
    //hardcoded data
    arr: {'files': []},
    currentComments: new Array(),
    currentProjectId: 0,
    currentProject: new Array(),
    currentFileId: 0,
    currentFileMetaData: new Array(),
    currentMetaY: 0,
    currentMetaHeight: 0,
    myProjects: new Array(),
    user: null,
    fullScreen: false,
    initializeTimeline: function(projectId, next){
        $(".timeline").empty();
        this.currentProjectId = projectId;
        if (!this.user)
            this.getMyInfo(function(){
                next();
            });
        this.getWeek(timeline.selectedDate);
        this.getDisplayDate();
        this.updateTimeline();
    },
    getMyInfo: function(next){
        var context = this;
        $.get("../api/getMyInfo", function(user){
            context.user = user;
            next();
        });
    },
    getFiles: function(date1, date2, next){
        $.get("../api/getProjectFiles?prId=" + this.currentProjectId + "&date1=" + date1 + "&date2=" + date2, function(data, status){
            next(data);
        });
    },
    //show all the changes for the week that the selected date from
    showWeekView: function(obj){
        if (!this.animation) {
            this.animation = true;
            $(obj).attr("active", "true");
            $("#currentPeriod").attr("active", "false");
            $("#currentPeriod").text(this.labels.days);

            //animated move
            $("#period").animate({marginTop: "8px"}, 500);

            //set days view false
            this.settings.view.days = false;

            //remove text over the columns
            d3.selectAll("text").remove();

            //animate columns
            d3.selectAll("rect").transition().attr("y", this.timelineHeight + 2);

            //clear canvas and update timeline
            var context = this;
            setTimeout(function () {
                context.clearCanvas();
                context.updateTimeline();
            }, 500);
        }
    },
    //show all the changes for the day
    showDayView: function(obj){
        if (!this.animation) {
            this.animation = true;
            $(obj).attr("active", "true");
            $("#currentPeriod").html(this.getDisplayDate());
            $("#currentWeek").attr("active", "false");

            //animated move
            $("#period").animate({marginTop: "-15pt"}, 500);

            //set days view true
            timeline.settings.view.days = true;

            //remove text over the columns
            d3.selectAll("text").remove();
            //animate columns
            d3.selectAll("rect").transition().attr("y", this.timelineHeight + 2);

            //clear canvas and update timeline
            var context = this;
            setTimeout(function () {
                context.clearCanvas();
                context.updateTimeline();
            }, 500);
        }
    },
    //select previous period (week or day)
    previousPeriod: function()
    {
        if (!this.animation)
        {
            this.animation = true;
            var context = this;
            d3.selectAll("text").remove();
            d3.selectAll("rect").transition().attr("y", this.timelineHeight + 2);

            if (this.settings.view.days)
                this.selectedDate.setDate(this.selectedDate.getDate() - 1);
            else this.selectedDate.setDate(this.selectedDate.getDate() - 7);

            setTimeout(function() {context.clearCanvas();
                                   context.updateTimeline();
                                    }, 500);
            this.animateDate(false);
        }
    },
    //select next period (week or day)
    nextPeriod: function(){
        if (!this.animation) {
            this.animation = true;
            var context = this;
            d3.selectAll("text").remove();
            d3.selectAll("rect").transition().attr("y", this.timelineHeight + 2);

            if (this.settings.view.days)
                this.selectedDate.setDate(this.selectedDate.getDate() + 1);
            else this.selectedDate.setDate(this.selectedDate.getDate() + 7);

            //check if date is not in the future
            if ((new Date(this.selectedDate).getTime() > new Date().getTime()))
                this.selectedDate = new Date();

            setTimeout(function () {
                context.clearCanvas();
                context.updateTimeline();
            }, 500);
            this.animateDate(true);
        }
    },
    //select or deselect discover files filter
    setDiscoverFilter: function(obj){
        $(obj).attr("state", $(obj).is(":checked"));
        this.settings.discover.show = $(obj).is(":checked");
        var tmpColor = this.stages.discover.color;
        if (!this.settings.discover.show){
            tmpColor = this.stages.discoverinactive.color;
            var borderColor = this.stages.discover.color;
        }
        this.fillSelectionWithColor(this.stages.discover.type, tmpColor, borderColor);
    },
    //select or deselect design files filter
    setDesignFilter: function(obj){
        $(obj).attr("state", $(obj).is(":checked"));
        this.settings.design.show = $(obj).is(":checked")
        var tmpColor = this.stages.design.color;
        if (!this.settings.design.show){
            tmpColor = this.stages.designinactive.color;
            var borderColor = this.stages.design.color;
        }
        this.fillSelectionWithColor(this.stages.design.type, tmpColor, borderColor);
    },
    //select or deselect deliver files filter
    setDeliverFilter: function(obj){
        $(obj).attr("state", $(obj).is(":checked"));
        this.settings.deliver.show = $(obj).is(":checked")
        var tmpColor = this.stages.deliver.color;
        if (!this.settings.deliver.show){
            tmpColor = this.stages.deliverinactive.color;
            var borderColor = this.stages.deliver.color;
        }
        this.fillSelectionWithColor(this.stages.deliver.type, tmpColor, borderColor);
    },
    //get week display name according to specific date
    getWeek: function(date){
        var today = new Date();
        var diff = this.getDaysBetween(today, date);
        var todayOfWeek = today.getDay();
        var selDayOfWeek =  date.getDay();

        if (todayOfWeek == 0) todayOfWeek = 7;
        if (selDayOfWeek == 0) selDayOfWeek = 7;
        if (todayOfWeek >= selDayOfWeek && todayOfWeek - selDayOfWeek - diff>= 0)
            return this.labels.thisweek;
        else if (diff - todayOfWeek + 1 <= 7) return this.labels.lastweek;
        else {
            return Math.ceil((diff - todayOfWeek + 1)/7) + this.labels.weeksago;}
    },
    //get amount of days between 2 dates
    getDaysBetween: function(firstDate, secondDate)
    {
        var oneDay = 24*60*60*1000;
        return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
    },
    //animation for days and weeks
    animateDate: function(next){
        var moveLeft = "-300px";
        var moveRight = "+300px";
        if (!next){
            moveLeft = "+300px";
            moveRight = "-300px";
        }
        var tmpWeek = this.getWeek(this.selectedDate);
        var context = this;
        if (tmpWeek != this.currentWeek)
        {
            this.currentWeek = tmpWeek;
            $("#currentWeek").animate({
                opacity: 0,
                marginLeft: moveLeft
            },500, function(){
                var dateString = context.getDisplayDate();
                $(this).html(tmpWeek);
                $(this).css("margin-left", moveRight);
                $(this).animate({
                        opacity: 1,
                        marginLeft: "0px"},
                    500, function(){
                        $(this).css("opacity", '');
                        if (context.currentWeek == context.labels.thisweek && !context.settings.view.days)
                            $("#next").fadeOut();
                        else $("#next").fadeIn();
                    });
            });
        }
        if (this.settings.view.days)
            $("#currentPeriod").animate({
                opacity: 0,
                marginLeft: moveLeft
            },500, function(){
                var dateString = context.getDisplayDate();
                $(this).html(dateString);
                $(this).css("margin-left", moveRight);
                $(this).animate({
                        opacity: 1,
                        marginLeft: "0px"},
                    500, function(){
                        $(this).css("opacity", '');
                        if (dateString == "Today")
                            $("#next").fadeOut();
                        else $("#next").fadeIn();
                    });
            });
    },
    //remove all the objects from canvas
    clearCanvas: function ()
    {
        d3.selectAll("g").remove();
        d3.selectAll("text").remove();
    },
    //calculate cnavas height (based on max commits of files)
    //now it is absolute but ideally it should be relative
    calculateCanvasHeight: function (files)
    {
        var maxDelta = 0;
        for (var i = 0; i < files.length; i++)
        {
            files[i].delta = 0;
            //check if this is max number of changes within this array
            if (files[i].delta > maxDelta)
                maxDelta = files[i].delta;
        }

        var tmpWidth = Math.round(($("#timelinecontainer").width() - files.length - 40)/files.length);
        if (tmpWidth < 20) tmpWidth = 20;
        if (tmpWidth > 80) tmpWidth = 80;
        this.columnWidth = tmpWidth;
        this.timelineHeight = (maxDelta/100000)*this.commitAppend + this.commitAppend*2 + 85;
    },
    //refresh timeline with selected date
    updateTimeline: function()
    {
        var context = this;
        var interval = this.getStampsInterval(this.selectedDate);
        this.getFiles(interval[0], interval[1], function(data){
            if (data){
                context.createTimeline(data);
            }
            else
            {
                context.animation = false;
            }
        });
    },
    //get 2 dates out of 1 with 00:00 and 23:59 time
    getStampsInterval: function (date){
        if (this.settings.view.days)
        {
            var start = new Date(date);
            var end = new Date(date);
        }
        else
        {
            var tmpDate = new Date(date.getTime())
                , day = tmpDate.getDay()
                , diffToMonday = tmpDate.getDate() - day + (day === 0 ? -6 : 1)
                , monday = new Date(tmpDate.setDate(diffToMonday))
                , sunday = new Date(monday);
            sunday.setDate(monday.getDate()+7);
            if (sunday.getDay() == 1)
                sunday.setDate(sunday.getDate() - 1);
            var start = new Date(monday);
            var end = new Date(sunday);
        }
        start.setHours(0);
        start.setMinutes(0);
        start.setSeconds(0);
        start.setMilliseconds(0);
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);
        end.setMilliseconds(999);
        return new Array(start.getTime(), end.getTime());
    },
    //get display date
    getDisplayDate: function(){
        var today = new Date();
        if (this.selectedDate.format("dd-mm-yy") == today.format("dd-mm-yy"))
            return "Today";
        else if (this.selectedDate.format("dd-mm-yy") == (function(){this.setDate(this.getDate()-1); return this}).call(new Date).format("dd-mm-yy"))
            return "Yesterday";
        else
            return this.selectedDate.format("ddd,&#160;mmmm&#160;d");;
    },
    //get display date
    getFormatDate: function(sdata){
        var today = new Date();
        if (sdata.format("dd-mm-yy") == today.format("dd-mm-yy"))
            return "Today, " + sdata.format("HH:MM");
        else if (sdata.format("dd-mm-yy") == (function(){this.setDate(this.getDate()-1); return this}).call(new Date).format("dd-mm-yy"))
            return "Yesterday, " + sdata.format("HH:MM");
        else
            return sdata.format("ddd,&#160;mmmm&#160;d HH:MM");
    },
    //get UTC date from timestamp
    getDateTime: function(timestamp)
    {
        return new Date(timestamp*1000);
    },
    getTimestamp: function(date)
    {
        return new Date(date).getTime();
    },
    getWeekName: function(num){
        switch (num) {
            case 1: return "Mon";
            case 2: return "Tue";
            case 3: return "Wed";
            case 4: return "Thu";
            case 5: return "Fri";
            case 6: return "Sat";
            case 0: return "Sun";
            default: return "Day";
        }
    },
    //cerate timeline, filling it with the data
    createTimeline: function(files) {
        this.calculateCanvasHeight(files);
        //set canvas width
        $(".timeline").css("width", files.length * this.columnWidth + this.marginLeftStep*(files.length-1) + 40);
        //set canvas height
        $(".timeline").css("height", this.timelineHeight + 2);
        var marginExtension = this.columnWidth/2;
        var context = this;
        this.defineFilters();
        files = this.sortFiles(files);
        var weekDay = false;
        var tmpCoordinates = new Object();
        var createBlock = false;
        for (var i = 0; i < files.length; i++)
        {
            if (!weekDay){
                weekDay = files[i].weekDay;
                tmpCoordinates.x = i*this.columnWidth + this.marginLeftStep*i + 20;
                tmpCoordinates.days = 0;
            }

            tmpCoordinates.days++;
            var makeLine = false;
            if (!this.settings.view.days && files[i+1] && weekDay != files[i+1].weekDay)
            {
                weekDay = files[i+1].weekDay;
                makeLine = true;
                createBlock = true;
            }
            else if (!this.settings.view.days && !files[i+1])
            {
                createBlock = true;
            }

            //positioning
            var file = d3.select('.timeline')
                .append("g");
            var designProcess = files[i].designProcess;
            if (!designProcess)
                designProcess = this.stages.none.type;

            var modName = null;
            if (files[i].modifier)
                modName = files[i].modifier.name;
            file.append('rect')
                .transition()
                .attr("cursor", "pointer")
                .attr("type", designProcess)
                .attr("x", i*this.columnWidth + this.marginLeftStep*i + 20)
                .attr("y", this.timelineHeight - this.commentsMaxHeight)
                .attr("width", this.columnWidth)
                .style("fill", this.stages.none.color)
                .attr("height", 0)
                .attr("meta-y", this.timelineHeight - this.commentsMaxHeight - files[i].delta*this.commitAppend - this.commitAppend)
                .attr("meta-height", files[i].delta*this.commitAppend + this.commitAppend)
                .attr("filesrc", files[i].file.path)
                .attr("fileid", files[i]._id)
                .attr("filename", files[i].file.name)
                .attr("extension", files[i].file.extension)
                .attr("filedesc", files[i].delta)
                .attr("modified", files[i].modified)
                .attr("modifier", modName)
                .each("end",function() {
                    d3.select(this)
                        .transition()
                        .duration(1000)
                        .attr("y", d3.select(this).attr("meta-y"))
                        .attr("height", d3.select(this).attr("meta-height"))
                        .ease('elastic');
                });
            if (createBlock){
                var tmpCoordX = i*this.columnWidth + this.marginLeftStep*i + 20 + this.columnWidth;
                file.append('text')
                    .attr("fill", "rgba(255,255,255,0.6)")
                    .attr("text-anchor", "middle")
                    .style("text-transform", "uppercase")
                    .style("font-size", "6pt")
                    .attr("x", tmpCoordX - (tmpCoordinates.days*this.columnWidth)/2)
                    .attr("y", 10)
                    .text(this.getWeekName(parseInt(files[i].weekDay)));
                tmpCoordinates.x = tmpCoordX;
                tmpCoordinates.days = 0;
                createBlock = false;
            }

            if (makeLine){
                file.append('rect')
                    .transition()
                    .attr("x", i*this.columnWidth + this.marginLeftStep*i + 20 + this.columnWidth)
                    .attr("y", this.timelineHeight - this.commentsMaxHeight)
                    .attr("meta-y", -35)
                    .attr("width", 1)
                    .style("fill", this.stages.separator.color)
                    .attr("height", 0)
                    .each("end",function() {
                        d3.select(this)
                            .transition()
                            .duration(1000)
                            .attr("y", d3.select(this).attr("meta-y"))
                            .attr("height", 100)
                            .ease('elastic');
                    });
            }

            var z = 0;
            if (files[i].metadata &&  files[i].metadata.comments)
                z =files[i].metadata.comments.length;
            var commentColor = context.stages.comments.new;
            var numberCommentsColor = context.stages.comments.textnew;
            if (files[i].metadata && files[i].metadata.seenBy)
                for (var k = 0; k <files[i].metadata.seenBy.length; k ++)
                {
                    if (files[i].metadata.seenBy[k].id == timeline.user.id){
                        commentColor = context.stages.comments.color;
                        numberCommentsColor = context.stages.comments.text;
                        break;
                    }
                }
            else commentColor = context.stages.comments.color;
            file.append('rect')
                .transition()
                .attr("cursor", "pointer")
                .attr("width", this.columnWidth)
                .attr("height", 0)
                .attr("meta-height", z*this.commentStep) //! files[i].comments
                .attr("x", i*this.columnWidth + this.marginLeftStep*i + 20)
                .attr("y", 0)
                .attr("comment-fileid", files[i]._id)
                .attr("meta-y", this.timelineHeight - this.commentsMaxHeight + 3)
                .style("fill", commentColor)
                .each("end",function() {
                    d3.select(this)
                        .transition()
                        .duration(1000)
                        .attr("y", d3.select(this).attr("meta-y"))
                        .attr("height", d3.select(this).attr("meta-height"))
                        .ease('elastic');
                });
            if (z > 0){
            var zPre = z;
            if (zPre > 5)
                zPre = 5;
            file.append('text')
                .attr("fill", numberCommentsColor)
                .attr("cursor", "pointer")
                .style("text-transform", "uppercase")
                .style("font-size", "6pt")
                .attr("x", i*this.columnWidth + this.marginLeftStep*i + marginExtension + 20)
                .attr("y", this.timelineHeight - this.commentsMaxHeight + 8 + (zPre*this.commentStep/3))
                .text(z);
            }

            file.append('text')
                .attr("width", this.columnWidth)
                .attr("height", 20)
                .attr("fill", "white")
                .attr("text-anchor", "middle")
                .attr("cursor", "pointer")
                .attr("filename", files[i].file.name)
                .style("text-transform", "uppercase")
                .style("font-size", "6pt")
                .attr("x", i*this.columnWidth + this.marginLeftStep*i + marginExtension + 20)
                .attr("y", this.timelineHeight - this.commentsMaxHeight - files[i].delta*this.commitAppend/2 - this.commitAppend/2 + 5)
                .text(files[i].file.shortName);//data.files[i].filename.split('.').pop()
            file.append('foreignObject')
                .attr("width", this.columnWidth*3)
                .attr("height", 20)
                .attr("visibility", "hidden")
                .attr("x", i*this.columnWidth + this.marginLeftStep*i + marginExtension + 20 - (this.columnWidth*1.5))
                .attr("y", this.timelineHeight - this.commentsMaxHeight - files[i].delta*this.commitAppend -1.5*this.commitAppend - 4)
                .append("xhtml:div")
                .attr("class", "file-tooltip")
                .html(files[i].file.name);
            file.on("mouseover", function(d) {
                //color filling
                context.columnOverTransition(d3.select(this).select("rect"));
                d3.select(this).selectAll(function() { return this.getElementsByTagName("foreignObject"); }).style("visibility", "visible");
            });
            file.on("mouseout", function(d) {
                //color filling
                context.columnOutTransition(d3.select(this).select("rect"));
                d3.select(this).selectAll(function() { return this.getElementsByTagName("foreignObject"); }).style("visibility", "hidden");
            });
            file.on("click", function(d) {
                context.deselectAllFiles();
                $("#adddesc").fadeOut(function(){ $("#filedesc").fadeIn();});
                var column = d3.select(this).select("rect");
                context.currentFileId = column.attr("fileid");
                context.currentMetaY = column.attr("meta-y");
                context.currentMetaHeight = column.attr("meta-height");
                column.attr("active", true);
                column.style("filter", "url(#drop-shadow)");

                var commentbox = d3.select("rect[comment-fileid='"+ column.attr("fileid") + "']");
                commentbox.style("fill", context.stages.comments.color);

                $("#filesrc").attr("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
                $("#preloader_2").fadeIn();
                $(".comments").empty();
                $("#filemodified").html("<span class='glyphicon glyphicon-pencil'></span>&nbsp;" + context.getFormatDate(new Date(parseInt(column.attr("modified")))));
                if (column.attr("modifier")){
                    $("#modifierrow").fadeIn();
                    $("#filemodifier").html("<span class='glyphicon glyphicon-user'></span>&nbsp;" + column.attr("modifier"));
                }
                else{
                    $("#modifierrow").fadeOut();
                }
                $.get("../api/getFile?prId=" + context.currentProjectId + "&fileId=" + column.attr("fileid"), function(data, status){
                    if (data)
                    {
                        var mediaInfo = JSON.parse(data);
                        var ext = column.attr("extension").toLowerCase();
                        context.commentsSeen();
                        if (ext == "jpeg" || ext == "jpg" || ext == "png" || ext == "gif"){
                            $("#doc").hide();
                            $("#filesrc").show();
                            $("#filesrc").attr("src", mediaInfo.url);
                            $("#preloader_2").fadeOut();
                            $("#fullscreen").attr("src", mediaInfo.url);
                            $("#fullscreen").show();
                            $("#original").attr("href", mediaInfo.url);
                            $("#original").show();
                            $("#leftblock").removeClass("col-md-6").addClass("col-md-8");
                            $("#rightblock").removeClass("col-md-8").addClass("col-md-4");
                            $("#point").fadeIn();
                            $("#point-status").hide();
                            $("#re-point").hide();
                            $("#remove-point").hide();
                            $("#newpoint").hide();
                            $("body").removeClass("pointingMode");
                            pointingMode = false;
                            pointPos = null;
                            //$("#filesrc").attr("data-zoom-image", mediaInfo.url);
                            //$(".zoomContainer").remove();
                            //$("#filesrc").elevateZoom({constrainType:"height", constrainSize:274, zoomType: "lens", containLensZoom: true, gallery:'gallery_01', cursor: 'pointer', galleryActiveClass: "active"});
                        }
                        else
                        {
                            $("#leftblock").removeClass("col-md-8").addClass("col-md-6");
                            $("#rightblock").removeClass("col-md-4").addClass("col-md-6");
                            $("#filesrc").hide();
                            $("#original").hide();
                            $("#fullscreen").hide();
                            $("#doc").attr("href", mediaInfo.url);
                            $("#docname").text(column.attr("filename"));
                            $("#doc").fadeIn();
                            $("#preloader_2").fadeOut();
                            $("#point").hide();
                            $("#point-status").hide();
                            $("#re-point").hide();
                            $("#remove-point").hide();
                            $("#newpoint").hide();
                            $("body").removeClass("pointingMode");
                            pointingMode = false;
                            pointPos = null;
                        }
                    }
                });

                $(".typeselector").attr("act", false);
                $("#filename").attr("type", column.attr("type"));
                $(".typeselector[type='" + column.attr("type") + "']").attr("act", true);
                $.get("../api/getFileMetadata?prId=" + context.currentProjectId + "&fileId=" + column.attr("fileid"), function(data, status){
                    if (data && data != "")
                        context.currentFileMetaData = data;
                    else
                        context.currentFileMetaData = {_id: "unknown", version: timeline.currentFileId, description: "", comments: []};

                    if (data.description){
                        $("#filedesc").html("<span class='editDescription' fileId='" + column.attr("fileid") + "'>" + data.description + "</span>");
                    }
                    else
                    {
                        $("#filedesc").html("<span class='editDescription' fileId='" + column.attr("fileid") + "'>" + context.labels.addDescription + "</span>");
                    }
                    context.updateComments();
                });

                $("#filename").text(column.attr("filename"));
                $("#content").fadeIn();
            });
        }
        if (files.length > 0)
            file.append('rect')
                .transition()
                .attr("width", this.columnWidth*files.length + files.length - 1)
                .attr("height", 1)
                .attr("x", 20)
                .attr("meta-y", this.timelineHeight - 45 - 4)
                .attr("y", 0)
                .style("fill", this.stages.none.color)
                .each("end",function() {
                    d3.select(this)
                        .transition()
                        .duration(1000)
                        .attr("y", d3.select(this).attr("meta-y"))
                        .ease('elastic');
                });

        if (files.length == 0)
        {
            $(".timeline").css("width", 140);
            $(".timeline").css("height", 100);
            d3.select('.timeline')
                .append('text')
                .text(this.labels.nothingtoshow)
                .attr('fill', this.stages.none.colorHover)
                .attr("x", 10)
                .attr("y", 30)
                .attr("font-size", 12)
                .attr("width", 300)
                .style("text-align", "center");
        }
        setTimeout(function(){ context.fillWithColor(); context.animation = false;}, 1000);
    },
    sortFiles: function(files){
        var context = this;
        var byModificationDate = files.slice(0);
        byModificationDate.sort(function(a,b) {
            return a.modified - b.modified;
        });
        for (var i = 0; i < byModificationDate.length; i++)
        {
            byModificationDate[i].weekDay = (new Date(byModificationDate[i].modified)).getDay();
        }
        var byCommentDate = new Array();
        for (var j = 0; j < 7; j++)
        {
            var byCommentDateWithinDay = new Array();
            for (var i = 0; i < byModificationDate.length; i++)
            {
                if (j == byModificationDate[i].weekDay)
                {
                    byCommentDateWithinDay.push(byModificationDate[i]);
                }
            }
            byCommentDateWithinDay.sort(function(a,b) {
                var date1 = 0;
                var date2 = 0;
                if (a.metadata && a.metadata.comments && a.metadata.comments.length > 0) {
                    for (var k = 0; k < a.metadata.comments.length; k++)
                    {
                       var tmpDate1 = context.getTimestamp(a.metadata.comments[k].date);
                       if (tmpDate1 > date1)
                        date1 = tmpDate1;
                    }
                }
                if (b.metadata && b.metadata.comments && b.metadata.comments.length > 0) {
                    for (var k = 0; k < b.metadata.comments.length; k++)
                    {
                        var tmpDate2 = context.getTimestamp(b.metadata.comments[k].date);
                        if (tmpDate2 > date2)
                            date2 = tmpDate2;
                    }
                }
                return date1 - date2;
            });
            for (var z = 0; z < byCommentDateWithinDay.length; z++)
            {
                byCommentDate.push(byCommentDateWithinDay[z]);
            }
        }
        return byCommentDate;
    },
    search: function(request){
        var context = this;
        var blocks = d3.selectAll("[filename]");
        blocks.each(function() {
            var filename = d3.select(this).attr("filename").toLowerCase();
            if (filename.indexOf(request.toLowerCase()) > -1)
            {
                d3.select(this)
                    .style("opacity", "");
            }
            else
            {
                d3.select(this)
                    .style("opacity", "0.1");
            }
        })
    },
    getPreview: function(path, next){
        $.get("../api/getPreview?prId=" + this.currentProjectId + "&path=" + path, function(data, status){
            next(data);
        });
    },
    commentsSeen: function(){
        $.post( "../api/commentsSeen", { prId: this.currentProjectId, fileId: this.currentFileId}, function(data){

        });
    },
    updateFileDescription: function(description, next)
    {
        $.post( "../api/updateFileDescription", { prId: this.currentProjectId, fileId: this.currentFileId, description: description }, function(data){
            next(data);
        });
    },
    defineFilters: function(){
        var defs = d3.select('.timeline').append("defs");
        var filterShadow = defs.append("filter")
            .attr("id", "drop-shadow")
        filterShadow.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 2)
            .attr("result", "blur");
        filterShadow.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 0)
            .attr("dy", 0)
            .attr("result", "offsetBlur");
        var feMerge = filterShadow.append("feMerge");

        feMerge.append("feMergeNode")
            .attr("in", "offsetBlur")
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");
    },
    deselectAllFiles: function() {

        d3.selectAll("g").selectAll("[active='true']")
            .style("filter", "none")
            .attr("y", this.currentMetaY)
            .attr("height", this.currentMetaHeight)
            .attr("active", false);
    },
    addComment: function(comment, points, next){
        var context = this;
        $.post( "../api/addComment", { prId: this.currentProjectId, fileId: this.currentFileId, comment: comment, points: points }, function(data){
            next(data);
        });
        this.currentFileMetaData.comments.push({_id: context.generateGuid(),userId: 0, date: new Date(), comment: comment, points: points, userId: {userName: this.user.name }});
        pointPos = null;
        this.updateComments();

    },
    updateComments: function(){
        $(".comments").empty();
        $(".points").empty();
        if (this.currentFileMetaData.comments){
            for (var j = 0; j < this.currentFileMetaData.comments.length; j++)
            {
                if (this.user.id == this.currentFileMetaData.comments[j].userId._id)
                    var removeIcon = "<span class='glyphicon glyphicon-remove right remove' commentId=' " + this.currentFileMetaData.comments[j]._id + " '></span>";
                else var removeIcon = "";
                $(".comments").append("<div id='c" + this.currentFileMetaData.comments[j]._id + "' class='comment' points='" + this.currentFileMetaData.comments[j].points + "'><p><span class='author'>" + this.currentFileMetaData.comments[j].userId.userName + "</span><span class='time'>&nbsp;&mdash;&nbsp;" + this.getFormatDate(new Date(this.currentFileMetaData.comments[j].date)) +  "</span>" + removeIcon + "</p><p refcomment='" + this.currentFileMetaData.comments[j]._id + "' id='commenttext" + this.currentFileMetaData.comments[j]._id + "'>" + this.currentFileMetaData.comments[j].comment + "</p></div>");
                if (this.currentFileMetaData.comments[j].points && this.currentFileMetaData.comments[j].points != "undefined")
                {
                    $("#commenttext" + this.currentFileMetaData.comments[j]._id).addClass("point-comment");
                    var coords = this.currentFileMetaData.comments[j].points.split(";");
                    $(".points").append("<span id='point" + this.currentFileMetaData.comments[j]._id + "' refcomment='" + this.currentFileMetaData.comments[j]._id + "' class='pointing' style='display: block; width: 32px; height: 32px; background-size: 32px; margin-left:" + (parseInt(coords[0]) - 10) + "px;margin-top:" + (parseInt(coords[1]) - 10) + "px'></span>")
                }
            }
        }
        $(".point-comment").click(function(){
            $(".comment").attr("point", "false");
            $(".pointing").attr("active", "false");
            $("#c" + $(this).attr("refcomment")).attr("point", "true");
            $("#point" + $(this).attr("refcomment")).animate({backgroundSize: "64px", width: "64px", height: "64px", opacity: 1}, function(){
                $(this).animate({backgroundSize: "32px", width: "32px", height: "32px"}, function() {
                    $(this).attr("active", "true");
                    $(this).css("opacity", "");
                });
            })
        });
        $(".pointing").click(function(){
            $(".comment").attr("point", "false");
            $(".pointing").attr("active", "false");
            $("#c" + $(this).attr("refcomment")).attr("point", "true");
            $(this).animate({backgroundSize: "64px", width: "64px", height: "64px", opacity: 1}, function(){
                $(this).animate({backgroundSize: "32px", width: "32px", height: "32px"}, function() {
                    $(this).attr("active", "true");
                    $(this).css("opacity", "");
                });
            })
        })
        $(".remove").click(function(){
            $(this).parents(".comment").fadeOut(function(){$(this).remove();});
            var id = $(this).parents(".comment").attr("id").replace("c","");
            $("#point" + id).remove();
            for (var i = 0; i < timeline.currentFileMetaData.comments.length; i++)
            {
                var com = timeline.currentFileMetaData.comments[i];
                if (com._id.trim() == $(this).attr("commentId").trim())
                {
                    timeline.currentFileMetaData.comments.splice(i, 1);
                    break;
                }
            }
            $.post( "../api/removeComment", { prId: timeline.currentProjectId, fileId: timeline.currentFileId, commentId: $(this).attr("commentId") }, function(data){

            });
        })
    },
    //fill with color columns
    fillWithColor: function (){
        if (this.settings.design.show)
            d3.selectAll("g").selectAll("[type=" + this.stages.design.type + "]")
                .transition()
                .style("fill", this.stages.design.color);
        else d3.selectAll("g").selectAll("[type=" + this.stages.design.type + "]")
            .transition()
            .style("fill", this.stages.designinactive.color);
        if (this.settings.discover.show)
            d3.selectAll("g").selectAll("[type=" + this.stages.discover.type + "]")
                .transition()
                .style("fill",this.stages.discover.color);
        else d3.selectAll("g").selectAll("[type=" + this.stages.discover.type + "]")
            .transition()
            .style("fill",this.stages.discoverinactive.color);
        if (this.settings.deliver.show)
            d3.selectAll("g").selectAll("[type=" + this.stages.deliver.type + "]")
                .transition()
                .style("fill",this.stages.deliver.color);
        else d3.selectAll("g").selectAll("[type=" + this.stages.deliver.type + "]")
            .transition()
            .style("fill",this.stages.deliverinactive.color);
        d3.selectAll("g").selectAll("[type=" + this.stages.none.type + "]")
            .transition()
            .style("fill",this.stages.none.color);
    },
    //fill or refill specific type of files with color(design, deliver, discover).
    //use with filters
    fillSelectionWithColor: function(type, color, border){
        d3.selectAll("g").selectAll("[type=" + type + "]")
            .transition()
            .style("fill", color)
            .attr("stroke", border)
            .attr("stroke-width", "2")
            .each("end",function() {
                d3.select(this)
                    .transition()
                    .attr("y", parseInt(d3.select(this).attr("meta-y")) - 3)
                    .attr("height", parseInt(d3.select(this).attr("meta-height")) + 3)
                    .each("end",function() {
                        d3.select(this)
                            .transition()
                            .attr("y", d3.select(this).attr("meta-y"))
                            .attr("height", d3.select(this).attr("meta-height"));
                    });
            });
    },
    updateFileType: function(type, next){

        $.post( "../api/updateFileType", { prId: this.currentProjectId, fileId: this.currentFileId, type: type }, function(data){
            next(data);
        });

        if (type == "discover")
            var tmpColor = this.stages.discover.color;
        else if (type == "design")
            var tmpColor = this.stages.design.color;
        else if (type == "deliver")
            var tmpColor = this.stages.deliver.color;
        else var tmpColor = this.stages.unknown.color;

        d3.selectAll("g").selectAll("[fileid='" + this.currentFileId + "']")
            .transition()
            .attr("type", type)
            .style("fill", tmpColor);
    },
    //mouse over column event
    columnOverTransition: function (column)
    {
        var ac = column
            .transition()
            .attr("y", column.attr("meta-y") - 3)
            .attr("height", parseInt(column.attr("meta-height")) + 3);
        if (column.attr("type") == this.stages.design.type){
            ac.style("fill", this.stages.design.colorHover);
        }
        else if (column.attr("type") == this.stages.discover.type){
            ac.style("fill", this.stages.discover.colorHover);
        }
        else if (column.attr("type") == this.stages.deliver.type){
            ac.style("fill", this.stages.deliver.colorHover);
        }
        else ac.style("fill", this.stages.none.colorHover);
    },
    //mouse out column event
    columnOutTransition: function(column)
    {
        if (column.attr("active") != "true")
        {
            var ac = column
                .transition()
                .attr("y", column.attr("meta-y"))
                .attr("height", parseInt(column.attr("meta-height")));
            if (column.attr("type") == this.stages.design.type){
                if (this.settings.design.show)
                    ac.style("fill", this.stages.design.color);
                else
                    ac.style("fill", this.stages.designinactive.color);
            }
            else if (column.attr("type") == this.stages.discover.type){
                if (this.settings.discover.show)
                    ac.style("fill", this.stages.discover.color);
                else
                    ac.style("fill", this.stages.discoverinactive.color);
            }
            else if (column.attr("type") == this.stages.deliver.type){
                if (this.settings.deliver.show)
                    ac.style("fill", this.stages.deliver.color);
                else
                    ac.style("fill", this.stages.deliverinactive.color);
            }
            else ac.style("fill", this.stages.none.color);
        }
    },
    openFullscreen: function(){
        $(".omnibox").css("background-image", "url(" + $("#fullscreen").attr("src") + ")");
        $(".omnibox").css("background-position", "center");
        $(".omnibox").css("background-repeat", "no-repeat");
        $("body").css("overflow", "hidden");
        $(".omnibox").fadeIn(function(){
            $(".escape").fadeIn(function(){
                $(this).fadeOut(2000);;
            });
        });
        this.fullScreen = true;
    },
    closeFullscreen: function(){
        if (this.fullScreen)
        {
            $("body").css("overflow", "");
            $(".omnibox").fadeOut(function(){$(".omnibox").css("background", "");});
            this.fullScreen = false;
        }
    },
    generateGuid: function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }
}

//date format plugin
var dateFormat = function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };
    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;
        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }
        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");
        mask = String(dF.masks[mask] || mask || dF.masks["default"]);
        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }
        var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };
        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();
// Some common format strings
dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};
// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};
// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};