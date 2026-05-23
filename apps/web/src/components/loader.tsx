import Spinner from "./ui/spinner";

export default function Loader() {
	return (
		<div className="flex min-h-[40vh] items-center justify-center">
			<Spinner className="size-6" />
		</div>
	);
}
