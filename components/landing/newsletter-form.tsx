"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // Updated to use sonner directly

const FormSchema = z.object({
  email: z.string().email({
    message: "Enter a valid email.",
  }),
});

export function NewsletterForm({ className }: { className?: string }) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    form.reset();
    toast.success("Subscribed!", {
      description: `We'll send study tips and quiz updates to ${data.email}.`,
      duration: 5000,
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={className} // Pass className from SiteFooter (mt-4)
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-foreground">
                Level up with GibbiAI
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="janedoe@example.com"
                  className="w-full rounded-full border-border bg-background px-4 text-foreground placeholder-muted-foreground focus:ring-primary" // layout → spacing → typography → colors → borders → interactivity
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="sm"
          className="mt-2 w-full rounded-full bg-primary px-4 text-primary-foreground transition-all hover:bg-primary/90" // spacing → layout → colors → transitions → interactivity
        >
          Subscribe
        </Button>
      </form>
    </Form>
  );
}