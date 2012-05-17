
$(document).ready(function() {
	$('#et_save').unbind('click').click(function() {
		if (!$(this).hasClass('inactive')) {
			disableButtons();
			return true;
		}
		return false;
	});

	$('#et_cancel').unbind('click').click(function() {
		if (!$(this).hasClass('inactive')) {
			$('#dialog-confirm-cancel').dialog({
				resizable: false,
				height: 140,
				modal: true,
				buttons: {
					"Yes, cancel": function() {
						$(this).dialog('close');

						disableButtons();

						if (m = window.location.href.match(/\/update\/[0-9]+/)) {
							window.location.href = window.location.href.replace('/update/','/view/');
						} else {
							window.location.href = '/patient/episodes/'+et_patient_id;
						}
					},
					"No, go back": function() {
						$(this).dialog('close');
						return false;
					}
				}
			});
		}
		return false;
	});

	$('#address_target').change(function() {
		var nickname = $('#ElementLetter_use_nickname').is(':checked') ? '1' : '0';

		if ($(this).children('option:selected').val() != '') {
			if ($(this).children('option:selected').text().match(/NO ADDRESS/)) {
				alert("Sorry, this contact has no address so you can't send a letter to them.");
				$(this).val(selected_recipient);
				return false;
			}

			var val = $(this).children('option:selected').val();

			$.ajax({
				'type': 'GET',
				'dataType': 'json',
				'url': '/OphCoCorrespondence/Default/getAddress?patient_id='+patient_id+'&address_id='+val+'&nickname='+nickname,
				'success': function(data) {
					correspondence_load_data(data);
					selected_recipient = val;

					// try to remove the selected recipient's address from the cc field
					if ($('#ElementLetter_cc').val().length >0) {
						$.ajax({
							'type': 'GET',
							'url': '/OphCoCorrespondence/Default/getCc?patient_id='+patient_id+'&contact_id='+val,
							'success': function(text) {
								if (!text.match(/NO ADDRESS/)) {
									if ($('#ElementLetter_cc').val().length >0) {
										var cur = $('#ElementLetter_cc').val();

										if (cur.indexOf(text) != -1) {
											var strings = cur.split("\n");
											var replace = '';

											for (var i in strings) {
												if (strings[i].length >0 && strings[i].indexOf(text) == -1) {
													if (replace.length >0) {
														replace += "\n";
													}
													replace += $.trim(strings[i]);
												}
											}

											if (replace.length >0 && !replace.match(/^cc:/)) {
												replace = "cc:\t"+replace;
											}

											$('#ElementLetter_cc').val(replace);
										}
									}

									var targets = '';

									$('#cc_targets').children().map(function() {
										if ($(this).val() != val) {
											targets += '<input type="hidden" name="CC_Targets[]" value="'+$(this).val()+'" />';
										}
									});
									$('#cc_targets').html(targets);
								} else {
									alert("Warning: letters should be cc'd to the patient's GP, but the current patient's GP has no valid address.");
								}
							}
						});
					}

					// if the letter is to anyone but the GP we need to cc the GP
					if (val != 'gp') {
						$.ajax({
							'type': 'GET',
							'url': '/OphCoCorrespondence/Default/getCc?patient_id='+patient_id+'&contact_id=gp',
							'success': function(text) {
								if (!text.match(/NO ADDRESS/)) {
									if ($('#ElementLetter_cc').val().length >0) {
										var cur = $('#ElementLetter_cc').val();

										if (cur.indexOf(text) == -1) {
											if (!$('#ElementLetter_cc').val().match(/[\n\r]$/)) {
												cur += "\n";
											}

											$('#ElementLetter_cc').val(cur+"\t"+text);
											$('#cc_targets').append('<input type="hidden" name="CC_Targets[]" value="gp" />');
										}

									} else {
										$('#ElementLetter_cc').val("cc:\t"+text);
										$('#cc_targets').append('<input type="hidden" name="CC_Targets[]" value="gp" />');
									}
								} else {
									alert("Warning: letters should be cc'd to the patient's GP, but the current patient's GP has no valid address.");
								}
							}
						});
					} else {
						// if the letter is to the GP we need to cc the patient
						$.ajax({
							'type': 'GET',
							'url': '/OphCoCorrespondence/Default/getCc?patient_id='+patient_id+'&contact_id=patient',
							'success': function(text) {
								if (!text.match(/NO ADDRESS/)) {
									if ($('#ElementLetter_cc').val().length >0) {
										var cur = $('#ElementLetter_cc').val();

										if (cur.indexOf(text) == -1) {
											if (!$('#ElementLetter_cc').val().match(/[\n\r]$/)) {
												cur += "\n";
											}

											$('#ElementLetter_cc').val(cur+"\t"+text);
											$('#cc_targets').append('<input type="hidden" name="CC_Targets[]" value="patient" />');
										}

									} else {
										$('#ElementLetter_cc').val("cc:\t"+text);
										$('#cc_targets').append('<input type="hidden" name="CC_Targets[]" value="patient" />');
									}
								} else {
									alert("Warning: letters should be cc'd to the patient's GP, but the current patient's GP has no valid address.");
								}
							}
						});
					}
				}
			});
		}
	});

	$('#macro').change(function() {
		var nickname = $('#ElementLetter_use_nickname').is(':checked') ? '1' : '0';

		if ($(this).val() != '') {
			var m = $(this).val().match(/^([a-z]+)([0-9]+)$/);

			$.ajax({
				'type': 'GET',
				'dataType': 'json',
				'url': '/OphCoCorrespondence/Default/getMacroData?patient_id='+patient_id+'&macro_type='+m[1]+'&macro_id='+m[2]+'&nickname='+nickname,
				'success': function(data) {
					$('#ElementLetter_cc').val('');
					correspondence_load_data(data);
				}
			});
		}
	});

	$('#ElementLetter_use_nickname').click(function() {
		$('#address_target').change();
	});

	$('select.stringgroup').change(function() {
		var obj = $(this);
		var selected_val = $(this).children('option:selected').val();

		if (selected_val != '') {
			var m = selected_val.match(/^([a-z]+)([0-9]+)$/);

			$.ajax({
				'type': 'GET',
				'url': '/OphCoCorrespondence/Default/getString?patient_id='+patient_id+'&string_type='+m[1]+'&string_id='+m[2],
				'success': function(text) {
					correspondence_append_body(text);
					obj.val('');
				}
			});
		}
	});

	$('#from').change(function() {
		var	contact_id = $(this).children('option:selected').val();

		if (contact_id != '') {
			$.ajax({
				'type': 'GET',
				'url': '/OphCoCorrespondence/Default/getFrom?contact_id='+contact_id,
				'success': function(text) {
					$('#ElementLetter_footer').html(text);
				}
			});
		}
	});

	$('#cc').change(function() {
		var contact_id = $(this).children('option:selected').val();

		if (contact_id != '') {
			var ok = true;

			$('#cc_targets').children('input').map(function() {
				if ($(this).val() == contact_id) {
					ok = false;
				}
			});

			if (!ok) return true;

			$.ajax({
				'type': 'GET',
				'url': '/OphCoCorrespondence/Default/getCc?patient_id='+patient_id+'&contact_id='+contact_id,
				'success': function(text) {
					if (!text.match(/NO ADDRESS/)) {
						if ($('#ElementLetter_cc').val().length >0) {
							var cur = $('#ElementLetter_cc').val();

							if (!$('#ElementLetter_cc').val().match(/[\n\r]$/)) {
								cur += "\n";
							}

							$('#ElementLetter_cc').val(cur+"\t"+text+"\n");
						} else {
							$('#ElementLetter_cc').val("cc:\t"+text+"\n");
						}

						$('#cc_targets').append('<input type="hidden" name="CC_Targets[]" value="'+contact_id+'" />');
					} else {
						alert("Sorry, this contact has no address and so cannot be cc'd.");
					}
				}
			});
		}
	});

	$('#ElementLetter_body').unbind('keyup').bind('keyup',function() {
		et_oph_correspondence_body_cursor_position = $(this).prop('selectionEnd');

		if (m = $(this).val().match(/\[([a-z]{3})\]/)) {

			var text = $(this).val();

			$.ajax({
				'type': 'POST',
				'url': '/OphCoCorrespondence/Default/expandStrings',
				'data': 'patient_id='+patient_id+'&text='+text,
				'success': function(resp) {
					if (resp) {
						$('#ElementLetter_body').val(resp);
					}
				}
			});
		}
	});

	$('#ElementLetter_body').unbind('click').click(function() {
		et_oph_correspondence_body_cursor_position = $(this).prop('selectionEnd');
	});

	if ($('#OphCoCorrespondence_printLetter').val() == 1) {
		var m = window.location.href.match(/\/view\/([0-9]+)/);
		$.ajax({
			'type': 'GET',
			'url': '/OphCoCorrespondence/Default/markPrinted/'+m[1],
			'success': function(html) {
			}
		});
		printUrl('/OphCoCorrespondence/Default/print/'+m[1]+'?all=1',null,true);
	}

	$('#et_print').unbind('click').click(function() {
		var m = window.location.href.match(/\/view\/([0-9]+)/);
		printUrl('/OphCoCorrespondence/Default/print/'+m[1],null,true);
		return false;
	});

	$('#et_print_all').unbind('click').click(function() {
		var m = window.location.href.match(/\/view\/([0-9]+)/);
		printUrl('/OphCoCorrespondence/Default/print/'+m[1]+'?all=1',null,true);
		return false;
	});

	$('#et_confirm_printed').unbind('click').click(function() {
		var m = window.location.href.match(/\/view\/([0-9]+)/);

		$.ajax({
			'type': 'GET',
			'url': '/OphCoCorrespondence/Default/confirmPrinted/'+m[1],
			'success': function(html) {
				if (html != "1") {
					alert("Sorry, something went wrong. Please try again or contact support for assistance.");
				} else {
					location.reload(true);
				}
			}
		});
	});

	var selected_recipient = $('#address_target').val();
});

var et_oph_correspondence_body_cursor_position = 0;

function correspondence_load_data(data) {
	for (var i in data) {
		if (m = i.match(/^text_(.*)$/)) {
			$('#'+m[1]).val(data[i]);
		} else if (m = i.match(/^sel_(.*)$/)) {
			$('#'+m[1]).val(data[i]);
		} else if (m = i.match(/^check_(.*)$/)) {
			$('#'+m[1]).attr('checked',(data[i] == 1 ? true : false));
		} else if (m = i.match(/^textappend_(.*)$/)) {
			$('#'+m[1]).val($('#'+m[1]).val()+data[i]);
		} else if (m = i.match(/^hidden_(.*)$/)) {
			$('#'+m[1]).val(data[i]);
		} else if (m = i.match(/^elementappend_(.*)$/)) {
			$('#'+m[1]).append(data[i]);
		}
	}
}

function correspondence_append_body(text) {
	var cpos = et_oph_correspondence_body_cursor_position;
	var insert_prefix = '';

	var current = $('#ElementLetter_body').val();

	text = ucfirst(text);

	if (!text.match(/\.$/)) {
		text += '. ';
	}

	if (current == '') {
		$('#ElementLetter_body').val(text);
	} else {
		// attempt to intelligently drop the text in based on what it follows
		var preceeding_blob = current.substring(0,cpos);

		if (preceeding_blob.match(/\.$/)) {
			insert_prefix = ' ';
		} else if (preceeding_blob.match(/[a-zA-Z]+$/)) {
			insert_prefix = '. ';
		}

		$('#ElementLetter_body').val(current.substring(0,cpos) + insert_prefix + text + current.substring(cpos,current.length));
	}

	et_oph_correspondence_body_cursor_position += insert_prefix.length;
	et_oph_correspondence_body_cursor_position += text.length;
}

function ucfirst(str) {
	str += '';
	var f = str.charAt(0).toUpperCase();
	return f + str.substr(1);
}

function uclower(str) {
	str += '';
	var f = str.charAt(0).toLowerCase();
	return f + str.substr(1);
}
