import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

const NotConnected = () => {
  return (
    <>
    <Alert variant="destructive">
      <ExclamationTriangleIcon className="h-4 w-4" />
      <AlertTitle>Connect your wallet</AlertTitle>
      <AlertDescription>
        Please connect your wallet to continue.
      </AlertDescription>
    </Alert>
  </>
  )
}

export default NotConnected
