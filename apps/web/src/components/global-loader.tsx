import Spinner from "./ui/spinner";

export function GlobalLoader() {
	return (
		<div className="max-w-5xl lg:max-w-6xl w-full min-h-screen mx-auto p-2 sm:p-6">
			<div className="flex items-center justify-center h-96">
				<Spinner size={30} />
			</div>
		</div>
	);
}
