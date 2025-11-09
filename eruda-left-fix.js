// Script to move Eruda button to left side
setTimeout(function() {
	var erudaBtn = document.querySelector('.eruda-entry-btn');
	if (erudaBtn) {
		erudaBtn.style.right = 'auto';
		erudaBtn.style.left = '10px';
		console.log('✓ Eruda moved to LEFT side');
	} else {
		console.log('✗ Eruda button not found yet');
		// Try again after another second
		setTimeout(arguments.callee, 1000);
	}
}, 500);
