		timespanpicker = function(placeholderId, giventimespaces, givenOptions){
			var picker = $('#'+placeholderId);
			var myTimeSpan = false;
			var timespaces = giventimespaces;
			var options = {
				title: 'booking',
				slotpx: 20, // pixels
				slotsize: 30, // minutes
				minDuration: 60, // minutes
				maxDuration: 150, // minutes
				startDuration: 60, // minutes
				availabilityScope: {start: '9:00', end: '24:00'}
			};
			if (options){
				for (var o in givenOptions){
					options[o] = givenOptions[o];
					if (options.startDuration < options.minDuration)
						options.startDuration = options.minDuration;
					if (options.startDuration > options.maxDuration)
						options.startDuration = options.maxDuration;				
				}
			}
			var availability = {start: timeToMinutes(options.availabilityScope.start), end: timeToMinutes(options.availabilityScope.end) };
			
			function timeString(totalminutes){
				var hours = (Math.floor(totalminutes / 60)).toString();
				var minutes = (totalminutes % 60).toString();
				if (minutes.length == 1) minutes +='0';
				return hours+':'+minutes;
			}
		
			this.createTimespanContainer = function(){
				picker.append(
					'<div class="tsp-time" style="height:100%;"></div>'+
					'<div class="tsp-day" style="position:absolute;top:0;right:0;"></div>');
				var timespanDayMinutes = Math.floor((availability.end - availability.start)/options.slotsize);
				picker
					.css('height',timespanDayMinutes*options.slotpx)
					.css('position','relative')
					.addClass('tsp-container');
				picker.find('.tsp-day')
					.css('height',timespanDayMinutes*options.slotpx)
					.css('width',picker.width()-picker.find('.tsp-time').width());
				var timespanTimetable = picker.find('.tsp-time');
				for (var t = 0; t < timespanDayMinutes; t++){
					var timestr = timeString(availability.start+t*options.slotsize);
					timespanTimetable.append(
						'<div class="tsp-slot" style="width:100%;float:left;height:'+options.slotpx+'px;line-height:'+options.slotpx+'px"><span>'+timestr+'</span></div>'
					)
				}
			}
			
			this.createtimespaces = function(){
				function createtimespace(nr, start, end){
					var top = (start - availability.start)/options.slotsize*options.slotpx;
					var height= (end - start)/options.slotsize*options.slotpx;
					picker.find('.tsp-day').append(
						'<div id="tsp-timespace'+ s +'" class="tsp-timespace" style="position:absolute;left:0;width:100%;top:'+top.toString()+'px;height:'+height+'px;   "><p></p></div>')
				}
				for (var s in timespaces){
					createtimespace(s, timeToMinutes(timespaces[s].start),timeToMinutes(timespaces[s].end));
				}
				picker.find('.tsp-timespace > p').text('VRIJ').attr('title','klik hier naar toe');
			}
			
			this.createTimeSpan = function(title, duration){
				var height = duration/options.slotsize*options.slotpx;
				var id = placeholderId+'-timespan';
				$('#tsp-timespace0').append(
				'<div class="tsp-timespan" id="'+id+'" style="z-index:999;position:absolute;top:0;right:0;width:100%;height:'+height+'px"><div class="tsp-content"><p class="title">'+title+'</p><p class="tsp-timedata"></p></div></div>'
				);
				myTimeSpan = $('#'+id);
				myTimeSpan.css('height',options.startDuration/options.slotsize*options.slotpx);
				displayPickerEventTimeData();
			}
			
			function timeToMinutes(time){
				var p = time.indexOf(':');
				var minutes = 0;
				if (p > 0){
					minutes = parseInt(time.substr(0,p)) * 60;
					minutes += parseInt(time.substr(p+1));
				}
				return minutes;
			}
			
			function draggableOut(){
				var parent = myTimeSpan.parent();
				var timespanTop = myTimeSpan.position().top;
				var timespanHeight = myTimeSpan.height();
				var timespaceHeight = parent.height();
				var tooFar = timespanTop + timespanHeight - timespaceHeight;
				if (tooFar > 0) 								return tooFar;
				if (timespanTop < 0)						return timespanTop;
				return 0;
			}

			function getEventTimeData(event){
				var startDateTime = new Date(event.start);
				var start = startDateTime.getHours() * 60 + startDateTime.getMinutes();
				var endDateTime = new Date(event.end);
				var end = endDateTime.getHours() * 60 + endDateTime.getMinutes();
				var duration = end - start;
				return {start : start, end : end};
			}

			function getPickerEventTimeData(){
				var timespace = myTimeSpan.parent();
				var start = availability.start + timespace.position().top / options.slotpx * options.slotsize + myTimeSpan.position().top / options.slotpx * options.slotsize ;
				var end = start + myTimeSpan.height() / options.slotpx * options.slotsize;
				return {start : start, end : end};
			}

			function minutesToString(timeMinutes){
				var hours = (Math.floor(timeMinutes / 60)).toString();
				var minutes = (timeMinutes % 60).toString();
				return hours + ':' + ((minutes.length == 1)?'0':'') + minutes;	
			}

			function getDisplayPickerEventTimeData(eventMinutes){
				return '<span>' + minutesToString(eventMinutes.start) + '</span>-<span>' + minutesToString(eventMinutes.end)+'</span>';
			}

			function displayPickerEventTimeData(){
				var timeData = getPickerEventTimeData();
				if (timeData.start%30 == 0)
					myTimeSpan.find('p.tsp-timedata').html(getDisplayPickerEventTimeData(timeData));
			}

			function displayPickerEventTimeDataWhenDragging(){
				if (myTimeSpan.draggable('option','grid')=== false) return;
				displayPickerEventTimeData();			
			}
			// do this when initialising timespanpicker
			this.init = function(){
				// create container for timespanpicker
				this.createTimespanContainer();
				// create tsp-timespaces
				this.createtimespaces();
				// create timespan in first available timespace
				this.createTimeSpan(options.title, options.startDuration);
				
				myTimeSpan 
				.draggable({
					axis: "y",
					containment: picker.find('.tsp-day'),
					grid: [0, options.slotpx],
					start: function(event,ui){
						myTimeSpan[0].droppedTop = myTimeSpan.position().top; 
					},
					drag : function(event,ui){
						displayPickerEventTimeDataWhenDragging();
					},
					stop : function(event, ui){
						var timespanTop = myTimeSpan.position().top;
						var droppedTop = myTimeSpan[0].droppedTop;
						if (timespanTop != myTimeSpan[0].droppedTop){
							myTimeSpan.animate({'top': droppedTop+'px'},100,displayPickerEventTimeData);
						}
					}
				})
				.resizable({
					grid : [0, options.slotpx],
					containment: "parent",
					minHeight : options.minDuration/options.slotsize*options.slotpx,
					maxHeight : options.maxDuration/options.slotsize*options.slotpx,
					handles : 's',
					resize : function(event, ui){
						$('.tsp-timespace').each(function(){
							if (myTimeSpan.height() > $(this).height()) {
								$(this)
									.addClass('space-too-small')
									.droppable('disable')
									.find('>p').text('GEEN PLEK');
							} else {
								$(this)
									.removeClass('space-too-small')
									.droppable('enable')
									.find('>p').text('VRIJ');
							}
						});
						displayPickerEventTimeData();
					},
				});
				
				$('.ui-draggable').mousedown(function(e){
					if (e.target != $('.ui-resizable-s')[0])
						$(this).addClass('ui-draggable-dragging');
				});
				$('.ui-draggable').mouseup(function(e){
					if (e.target != $('.ui-resizable-s')[0])
						$(this).removeClass('ui-draggable-dragging');
				});		
				
				$('.ui-resizable-s').mousedown(function(e){
					if (e.target == this)
						$(this).parent().addClass('ui-resizable-resizing');
				});
				$('.ui-resizable-s').mouseup(function(e){
					if (e.target == this)
						$(this).parent().removeClass('ui-resizable-resizing');
				});			
				$('.tsp-timespace').droppable({
					accept: myTimeSpan,
					hoverClass: "tsp-droppable-active",
					over: function(){myTimeSpan.draggable('option','grid',[0, options.slotpx]);},
					out: function(){myTimeSpan.draggable('option','grid',false);},
					drop: function(event,ui){
						var timespanTop = myTimeSpan.position().top;
						oldparent = myTimeSpan.parent();
						newparent = $(this);
						if (newparent[0].id != oldparent[0].id){
							var oldTop = oldparent.position().top;
							var newTop = newparent.position().top;
							var deltaTop = newTop - oldTop;
							myTimeSpan.appendTo('#'+this.id);
							timespanTop = myTimeSpan.position().top-deltaTop;
							myTimeSpan.appendTo('#'+this.id);
						} 
						timespanTop = timespanTop - timespanTop % options.slotpx;
						myTimeSpan.css('top',timespanTop);
						timespanTop -= draggableOut();
						myTimeSpan[0].droppedTop = timespanTop;
						displayPickerEventTimeData();
					}
				});
				
				$('.tsp-timespace').click(function(event){
						if (!$(this).droppable( "option", "disabled" )){
							var oldparent = myTimeSpan.parent();
							var newparent = $(this);
							var timespanTop;
							var timespanHeight = myTimeSpan.height();
							if (newparent[0].id != oldparent[0].id){
								myTimeSpan.appendTo('#'+this.id);
								timespanTop = 0;
							} else {
								timespanTop = myTimeSpan.position().top;
							}
							var y = event.pageY- $(this).offset().top;
							if (timespanTop > y){
							// lift up until top of timespan is at or above mouse position
								while (timespanTop > y){
									timespanTop -= options.slotpx;
								}
							} else {
							// lower down until top+height of timespan is at or under mouse position
								while (timespanTop + timespanHeight < y ){
									timespanTop += options.slotpx;
								}		
							}
							myTimeSpan[0].droppedTop = timespanTop;
							myTimeSpan.css('top', myTimeSpan[0].droppedTop);
							displayPickerEventTimeData();
					}
				});
			}
			this.init();
			return this;
		}