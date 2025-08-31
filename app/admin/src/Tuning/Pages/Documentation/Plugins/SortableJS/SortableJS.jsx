import React, { useEffect } from 'react'
import Sortable from 'sortablejs';

const SortableJS = () => {

	useEffect(() => {
		const sortableInstances = [];

		// Simple list
		const el = document.getElementById('items');
		if (el) {
			const sortable = new Sortable(el);
			sortableInstances.push(sortable);
		}

		// List with handle
		const listWithHandle = document.getElementById('listWithHandle');
		if (listWithHandle) {
			const sortable2 = new Sortable(listWithHandle, {
				handle: '.fa-arrows',
				animation: 150
			});
			sortableInstances.push(sortable2);
		}

		// Shared lists
		const list = document.getElementById('list');
		if (list) {
			const sortable3 = new Sortable(list, {
				group: 'shared',
				animation: 100
			});
			sortableInstances.push(sortable3);
		}

		const list2 = document.getElementById('list2');
		if (list2) {
			const sortable4 = new Sortable(list2, {
				group: 'shared',
				animation: 100,
				emptyInsertThreshold: 5 // this is the default
			});
			sortableInstances.push(sortable4);
		}

		// Cleanup function
		return () => {
			sortableInstances.forEach(instance => {
				if (instance && instance.destroy) {
					instance.destroy();
				}
			});
		};
	}, []);

	const sortableCode = `
  import Sortable from 'sortablejs';

  useEffect(() => {
    const el = document.getElementById('items');
    const sortable = new Sortable(el);
    })
  }, []);

  return (
    <ul className="list-unstyled" id="items">
      <li className="card mb-1 theme-color1 text-white"><div className="card-body">item 1</div></li>
      <li className="card mb-1 theme-color2 text-white"><div className="card-body">item 2</div></li>
      <li className="card mb-1 theme-color3 text-white"><div className="card-body">item 3</div></li>
      <li className="card mb-1 theme-color4 text-white"><div className="card-body">item 4</div></li>
      <li className="card mb-1 theme-color5 text-white"><div className="card-body">item 5</div></li>
      <li className="card mb-1 theme-color6 text-white"><div className="card-body">item 6</div></li>
    </ul>
  )
  `;

	return (
		<div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">
			<div className="card border-0 bg-transparent">
				<div className="card-body p-0">
					<div className="row g-3">
						<div className="col-12">
							<h4 className="mb-4">Sortable js</h4>
							<p className="lead">Sortable is a JavaScript library for reorderable drag-and-drop lists.</p>
							<div className="rounded-4 " data-lang="html">
								<pre className='h6 language-html text-primary'><code>{sortableCode}</code></pre>
							</div>
						</div>
						<div className="col-12">
							<h5>Simple list</h5>
							<ul className="list-unstyled" id="items">
								<li className="card mb-1 theme-color1 text-white"><div className="card-body">item 1</div></li>
								<li className="card mb-1 theme-color2 text-white"><div className="card-body">item 2</div></li>
								<li className="card mb-1 theme-color3 text-white"><div className="card-body">item 3</div></li>
								<li className="card mb-1 theme-color4 text-white"><div className="card-body">item 4</div></li>
								<li className="card mb-1 theme-color5 text-white"><div className="card-body">item 5</div></li>
								<li className="card mb-1 theme-color6 text-white"><div className="card-body">item 6</div></li>
							</ul>
						</div>
						<div className="col-12">
							<h5>Handle</h5>
							<ul className="list-group" id="listWithHandle">
								<li className="list-group-item d-flex justify-content-between align-items-center">
									<span>
										<span className="fa fa-arrows me-2" aria-hidden="true"></span>
										A list item
									</span>
									<span className="badge bg-primary rounded-pill">14</span>
								</li>
								<li className="list-group-item d-flex justify-content-between align-items-center">
									<span>
										<span className="fa fa-arrows me-2" aria-hidden="true"></span>
										A second list item
									</span>
									<span className="badge bg-primary rounded-pill">2</span>
								</li>
								<li className="list-group-item d-flex justify-content-between align-items-center">
									<span>
										<span className="fa fa-arrows me-2" aria-hidden="true"></span>
										A third list item
									</span>
									<span className="badge bg-primary rounded-pill">1</span>
								</li>
							</ul>
						</div>
						<div className="col-12">
							<h5>Shared lists</h5>
							<div className="row g-3">
								<div className="col-md-6">
									<h6>List 1</h6>
									<ul id="list" className="list-group">
										<li className="list-group-item theme-color1 text-white">Item 1</li>
										<li className="list-group-item theme-color2 text-white">Item 2</li>
										<li className="list-group-item theme-color3 text-white">Item 3</li>
										<li className="list-group-item theme-color4 text-white">Item 4</li>
									</ul>
								</div>
								<div className="col-md-6">
									<h6>List 2</h6>
									<ul id="list2" className="list-group">
										<li className="list-group-item theme-color5 text-white">Item 5</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SortableJS