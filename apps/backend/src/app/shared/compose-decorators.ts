export const composeDecorators =
  (...decorators: ClassDecorator[]): ClassDecorator =>
  (originalTarget) =>
    decorators.reduceRight(
      (target, decorator) => decorator(target),
      originalTarget
    )
